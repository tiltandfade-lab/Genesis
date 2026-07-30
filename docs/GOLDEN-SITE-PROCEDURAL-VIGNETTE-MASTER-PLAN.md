---
type: orchestration-plan
project: Genesis
status: FOUNDER-AUTHORIZED PROGRAM — Waves 0–1 passed; Wave 2 is next; later waves are gate-locked
created: 2026-07-29
updated: 2026-07-29
owner: the unified Procedural Vignette Synthesizer program
authority:
  - ART-DIRECTION-CANON.md
  - GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md
  - GOLDEN-SITES-CATALOG.md
  - canon/SYSTEM-OWNERSHIP.md
execution_inputs:
  - GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md
  - GOLDEN-SITES-PROOF-QUEUE.md
  - GOLDEN-SITES-FOUNDER-QUEUE.md
  - BUILDING-PROGRAM-TABLE-FAMILIES.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
  - STRUCTURE-KIT-CATALOG.md
  - EXTRUDED-SPRITE-PROP-LIBRARY.md
  - MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md
  - MATERIAL-LANE.md
  - GROUND-MATERIALS-PROGRAM.md
  - TRIM-SHEET-PIPELINE.md
  - WALK-CARD-DEALING.md
  - WALK-CONSUMPTION.md
  - AUTOMATED-PLAYTEST.md
  - COMBAT.md
---

# GOLDEN SITE PROCEDURAL VIGNETTE MASTER PLAN

## 0. The ruling

Genesis will build **one Procedural Vignette Synthesizer**. Terrain formation and
building/site construction are stages of that engine, not separate engines. The
twelve Golden Sites are its representative coverage and acceptance portfolio, not
twelve runtime generators and not twelve hand-authored maps.

This is the governing execution plan for the next several weeks. Other sessions and
subplans serve it only when they close one of its named gates. Existing subsystem
documents remain the authority for their own contracts; this plan owns their order,
integration, evidence cadence, and definition of program completion.

Adam's direction, 2026-07-29:

> "ok so they cannot and should not be two separate engines, they are just two
> functions of the same engine"

> "this is our next big plan and move ... we need a multi wave plan and this will be
> THE ULTIMATE PLAN for the next several weeks which we only run multi-sessions when
> they serve the golden site engine right?"

> "running the golden site plan should also include intermittent battle simulations
> between PCS and enemies"

> "do you think running intermittent game testing should also happen? like run a huge
> census of walk rolls to make sure we are still getting solid coverage of everything
> we need? I assume at some points we will need to modify our walks to actually harness
> the things we are creating in these golden sites"

**Direct answer: yes.** Walk-demand census, playable game testing, and PC-versus-enemy
battle simulation are continuous tracks inside this program. A visually impressive
generator that real walks rarely invoke, that produces tactically inert boards, or that
requires the DM/player to rescue its composition has failed.

This directive authorizes this wave-gated program and Wave 0. It does not silently
promote unresolved founder proposals, authorize paid asset generation without a
demand receipt, or permit a later wave to bypass its entry gate.

## 1. Program outcome

The program succeeds when a real retained story/walk request can be compiled,
deterministically and with provenance, into a compact FFT/XCOM-quality vignette that:

1. preserves every canonical story fact that licensed it;
2. begins near a meaningful decision rather than requiring dull traversal;
3. combines connected natural terrain with deliberately constructed geometry;
4. supports social, exploration, and tactical readings of the same persistent place;
5. retains stable site, zone, surface, object, actor, and frontier ids across views;
6. selects or synthesizes assets through one semantic resolver with truthful fallbacks;
7. survives changed seeds, difficult envelopes, all four camera bearings, and real play;
8. can be transformed, resized, and culturally realized without losing the feature's
   defining relationships; and
9. exposes gaps as counted demand rather than filling them with unrelated random props.

“Large” means semantic breadth, persistent extent, unusual height/depth, or linked
identity. It does not mean a sprawling board. The active `MaterializationWindow` stays
compact; the larger place continues through precommitted frontiers, linked windows,
world context, memory, and prose.

## 2. How the Golden Site documents feed the program

The corpus is organized by job. No one document should absorb the others.

| Document | Program job | It does not own |
|---|---|---|
| `ART-DIRECTION-CANON.md` | founder taste, FFT boundary, camera, height, connected-natural/chunky-constructed form law | runtime schemas or build order |
| `GOLDEN-SITES-CATALOG.md` | the twelve-case portfolio, status gates, retained site promises | one runtime site enum |
| `GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` | shared nouns and ownership from story truth through projection | weekly execution order |
| twelve `SITE-*` specs | generator-grade obligations, circuits, zones, first proofs, rejection/fallback | separate engines |
| `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md` | live/unwired source truth, retained compositions, provenance obligations | permission to preserve bugs forever |
| `GOLDEN-SITES-PROOF-QUEUE.md` | exact research, clay, tactical, dressed, and adversarial evidence still owed | founder taste choices |
| `GOLDEN-SITES-FOUNDER-QUEUE.md` | unresolved founder taste/build-order questions only | research and implementation tasks |
| `Reference/Golden-Site-Ideal-Art/` | visual form oracle and active-window scale targets | copied layouts or unverified mechanics |
| `intel/golden-site-engine-coverage.json` | machine-readable site/owner/obligation/wave/asset-demand routing inventory | runtime selection weights or independent canon |
| this master plan | integration order, coverage, asset routing, test cadence, wave gates, multi-session law | subsystem contract duplication |

Existing “implementation unauthorized” banners mean that a reader may not build
directly from an isolated study. Implementation authority now flows only through this
plan's current wave and its passed gates.

## 3. One engine, one request, several projections

### 3.1 Input contract

Every synthesis starts from a normalized `VignetteRequest`. It references source facts;
it does not copy or reroll them.

```text
VignetteRequest
  requestId / seed namespace / source roll refs
  world context and remembered facts
  walk family, active segment, connections, and approach facts
  persistent SiteIdentity
  HostProgram + OperatingModel
  SubstratePlan + ScaleContract
  ordered TransformStack
  desired materialization purpose
  actors, bodies, encounter/objective intent, and knowledge boundary
  camera, performance, and presentation budgets
```

The adapter classifies the request before geometry:

| Disposition | Meaning |
|---|---|
| `MATERIALIZE_NEW` | Commit a new persistent site/window because the story requires a place |
| `CONTINUE_EXISTING` | Re-enter or expand a precommitted frontier of the same site |
| `TRANSFORM_EXISTING` | Apply dormant, layered-control, damage, repair, occupation, flooding, or another legal delta |
| `DECORATE_LOCAL` | Add a licensed feature, trace, fixture, or encounter to the current window |
| `NARRATIVE_ONLY` | Keep the fact canonical without pretending it requires a board |
| `UNRESOLVED` | No current host, transform, substrate, asset, or adapter can truthfully answer it |

This classification is essential to the walk census. A wilderness “balanced rock” may
be a local feature; it is not automatically a new Golden Site. A harborfront may invoke
an Urban/Service host on a water-edge substrate; it does not require Golden Site 13.

### 3.2 Compilation path

```text
real story/world/walk facts
  -> normalize VignetteRequest and provenance
  -> commit host obligations, transforms, substrate, scale, and active purpose
  -> choose the smallest honest MaterializationWindow
  -> plan macro topology, circulation, fronts, quiet space, and objectives
  -> form one substrate/terrain field
  -> embed host construction, mechanisms, apertures, and supports in that field
  -> reserve tactical cells, routes, deployment, cover, sight, and interactions
  -> compile surfaces, seams, condition, dressing, light, and context
  -> resolve semantic asset requests through the asset foundry
  -> validate, score, reject/repair, and retain the complete receipt
  -> project SceneTray / TownTray / BattleMap / text / DM digest
```

Terrain and construction share the macro plan, support graph, elevation datum,
connections, and tactical reservations. A foundation cuts or bridges the terrain; a
road grades through it; a wall follows, resists, or deliberately contradicts it. The
building stage may request terrain edits, and the terrain stage may expose construction
opportunities, but neither owns a second map.

### 3.3 Output contract

One committed `VignettePlan` contains:

- `SemanticSitePlan`: roles, capacities, circuits, services, claims, mutable states;
- `MaterializationWindow`: active obligations, quiet space, stable frontiers;
- `SpatialPlanV2`: cells, volumes, elevation, boundaries, connections, provenance;
- `TacticalCompositionPlan`: routes, cover, sight, deployment, objectives, reservations;
- `SurfaceAssemblyPlan`: terrain/structure pieces, seams, materials, condition, light;
- `AssetResolutionPlan`: exact recipes, fallbacks, omissions, and unresolved debt;
- projection records for each view; and
- `SynthesisReceipt`: source lineage, seed chain, candidate scores, rejections, repairs,
  performance counts, and visual/playtest evidence.

The same committed geometry promotes into combat. Combat may increase precision and
activate tactical reservations; it may not regenerate the place into a convenient
arena.

### 3.4 Candidate, score, repair

The engine does not accept the first legal random arrangement.

1. Produce a bounded candidate set from the same semantic request.
2. Reject candidates that violate hard truth, support, access, collision, camera, or
   knowledge constraints.
3. Score survivors for route choice, tactical tension, composition hierarchy, quiet
   space, feature identity, camera legibility, and asset cost.
4. Repair only through named legal operators.
5. Retain the selected candidate and every rejection/repair reason.
6. Fall back through a declared simpler composition rather than hand-authoring a save.

Changing seed should change structure and relationships, not merely prop scatter or
material color.

## 4. The Golden coverage matrix

The portfolio covers host programs, transforms, and shared stress contracts. Every
runtime feature belongs to a shared owner even when a numbered case proves it.

| Site | Runtime role | The engine must prove | Principal asset demand |
|---:|---|---|---|
| 1 Guard Post | Defense/route-control host | road/shoulder, narrowing, threshold, observation, support room, defensible deck, flank/retreat | graded terrain; foundations, wall/gate/deck/stair grammar; barrier, signal, repair traces |
| 2 Camp / Service | transient/rooted service host | route-adjacent center, shelter/service/water/waste/watch circuits, permanence ladder, legal departure | ground anchoring; tents, wagon, fire/cook/water assemblies, screens and cargo |
| 3 Dormant / Abandoned | cross-host transform | absence and failed function remain legible; aperture, service, load, maintenance, event, and time consequences propagate causally | state geometry, breaches, collapse/talus, repair, grime/water/soot masks, residue props |
| 4 Monastery / Commune | communal institution host | court, repeated bays, shared/service/ritual hierarchy, processional height, alternate circulation | terraces, court/arcade/stair/roof grammar; well, bell, lectern, shrine and communal furnishings |
| 5 Mine / Workshop | extraction/work host | source-to-haul-to-process-to-store circuit, shaft/drift/landing, active/failing/recovering state | excavation terrain; supports, rails, platforms; carts, hoists, pumps, crushers, forge and spoil |
| 6 Prison / Custody | custody host | intake, holding, keeper oversight, property/evidence, service, release/transfer/escape | cells, bars, doors, keeper landing, routes; cage, locks, records, evidence storage, repair/breach |
| 7 Natural Lair | ecology/claim host | found/dug origin, body-scaled mouth, nest/claim, floor/ledge route, bolt-hole/short exit, causal darkness | connected cave terrain; mouths, ribs, ledges, roots, nest/larder, water/mineral/trace assets |
| 8 Layered Control | cross-host transform | two persistent claims alter recognition, access, service, custody, property, information, time, or violence without replacing the host | claim marks, schedules, attributed barriers/fixtures, evidence, sparse occupation and front overlays |
| 9 Contested Fortress | Defense + layered-control + multi-window stress | gate/wall/store/barracks/command continuity, wall routes, attributed ground, linked compact windows | tall terrain approaches and switchbacks; walls, towers, gates, stairs; barricades, signals, siege/service props |
| 10 Urban Institution | urban host/fabric | frontage, public/service circuits, street continuity, cold population, market/institution aggregation, cutaway | streets/steps/party walls/frontages/galleries/roofs; stalls, shutters, wells/fountains, signs and public equipment |
| 11 Mixed Scale / Dragon Domain | `ScaleContract` stress | unlike bodies receive consequentially different apertures, routes, cover, interaction, and domain continuity | scale-aware terrain/construction; large organic/structural donors; canonical actor standees and large-body proxies |
| 12 Anomalous / Living / Mobile | `SubstratePlan` stress | bog/raft/living/mobile/reactive support, cyclic datum, load, agency, tenure, and terminal substrate transformation | support graph and moving datum; raft/bog/living-ground assemblies, organic donors, wet/reactive materials and VFX |

### 4.1 Where the apparent gaps live

The first 1,050-walk census exposed useful gaps, but they do not require more numbered
Golden Sites:

| Demand | Correct home |
|---|---|
| Entertainment strip, tavern, inn, gambling or theater | ordinary Hospitality/Entertainment venue; Site 2 route-service or Site 10 frontage context; Sites 3/8 transforms |
| Harborfront, quay, ferry, waterside trade | Service/Urban/Infrastructure host on a water-edge `SubstratePlan`; Site 10 fabric and Site 12 support stress |
| Slum/low ward | Site 10 urban fabric + operating/maintenance/control state; poverty is not a geometry family |
| Dungeon infrastructure hub | Infrastructure/Works host using Site 5 circuits and Site 10 public/service logic |
| Crypt, mortuary, funerary institution | ordinary Funerary/Mortuary host; Site 3 only when actually dormant |
| Wilderness curiosity, monument, wreck, or odd object | `DECORATE_LOCAL`, `SubstratePlan`, hero feature, or narrative-only result according to affordance |
| Tavern/shop/shrine/home/clinic/court/warehouse/bathhouse | ordinary venue programs using the shared compiler and retained Golden Venue fixtures |

The census may still discover a genuinely missing **host program**, transform, or
substrate operator. It must add that shared concept, not mint a Golden number or route
around the engine.

## 5. Asset foundry: one semantic resolver, several production routes

### 5.1 Resolver law

The plan requests a semantic role plus physical and gameplay requirements:

```text
role + envelope + support/mount + state + interaction + realm/culture + performance
```

The resolver chooses the cheapest admitted route that preserves those requirements.
The requested noun never hard-codes “Meshy,” “sprite,” or a particular model.

Default fallback:

```text
admitted exact recipe
  -> compatible admitted donor/chassis recipe
  -> procedural or faced primitive with correct gameplay envelope
  -> presentation-only omission when safe
  -> unresolved debt
```

A missing asset never deletes a required threshold, route, cell, bar, hearth, well,
machine, evidence store, light source, or person.

### 5.2 Production-route census

| Route | It owns | It must not own |
|---|---|---|
| **In-engine procedural geometry** | terrain fields; water/void/support boundaries; roads and graded paths; walls, corners, ends, foundations, floors, roofs, apertures, stairs, ladders, landings, rails, platforms; collision/cover/occlusion; simple prisms/lathes/sweeps; exact sockets and stateful structural parts | noisy prop identity, finished culture, or render-time gameplay invention |
| **Existing admitted kits/donors** | first-choice reusable chassis and pieces with normalized scale, sockets, materials, collision, provenance, and fixed-camera proof | unreviewed pack dumping or kit-specific site logic |
| **Meshy donor generation** | difficult reusable volume and silhouette: natural formations, cave mouths/ribs, tents/canopies, wagons, mechanisms, civic/ritual equipment, defensive hero props, trace clusters, practical-light fixtures | whole buildings/sites, exact walls/stairs/roads/floors/roofs, ordinary boxes/furniture, condition masks, characters, LOD/recolor variants |
| **Sprite extrusion** | shallow silhouette nouns, apertures, shields, keys, signs, grates, door leaves, reliefs, emblems, foliage/board clusters, layered shallow assemblies | beds, barrels, trees, large mechanisms, architecture, or anything whose missing depth changes gameplay |
| **Faced boxes/chassis + generated faces** | beds, tables, cabinets, crates, pews, counters, shelves, sarcophagi, ordinary containers and coordinated state faces | replacing exact collision/support or baking directional scene light |
| **Procedural lathe/sweep** | bottles, urns, bowls, columns, ropes, chains, pipes, roots, horns, cables | arbitrary complex hero forms better served by a donor |
| **Material/texture foundry** | Material Maker parent graphs; albedo/normal/ORM; trim sheets; ground parents/patches; decals and masks; realm/culture channels; wetness, soot, moss, wear, breach, repair and other causal condition fields | deciding topology, circulation, mechanics, or adding random grunge |
| **Canonical standee sprites** | PCs, NPCs, creatures, readable identity/pose/state at the game camera | load-bearing geometry or collision truth |
| **Runtime VFX/light** | flame, emission, smoke, dust, water motion, atmosphere, range/falloff/shadows; always attached to an owned source | free-floating unexplained bulbs or topology |
| **Context cards/plates** | honest noninteractive near/mid/far world continuation with provenance, masks, camera and knowledge compatibility | traversable ground, interactive nouns, hidden canon, or false exits |

### 5.3 Demand-first production rules

1. Prove the composition in clay/proxy form before commissioning decorative art.
2. Search admitted existing kits and the model-foundry census before generating.
3. Promote a new procedural operator when several requests share exact topology or
   sockets; do not buy repeated standardized geometry from Meshy.
4. Use Meshy only when reusable complex volume beats local construction. Paid jobs
   require a Golden demand id, fallback, admission checklist, and reuse estimate.
5. Use sprite extrusion/faced boxes when front/side identity carries the noun and a
   trusted chassis can own volume.
6. Generate materials after shape, route, and contact pass. Condition derives from
   event/load/water/use/maintenance fields; it is not a grunge roll.
7. Every admitted asset carries dimensions, footprint, height, cover, walkability,
   support/mount, sockets, materials, scaling bounds, collision/occlusion, provenance,
   and canonical renders.
8. Every rejection teaches the router. Two repeated failures for the same structural
   reason reroute the family rather than consuming an endless generation loop.

### 5.4 Cross-site asset priority

Production order is set by **coverage multiplication**, not site number:

1. substrate/terrain, route, foundation, wall, aperture, stair, roof, support, and
   camera-safe cutaway operators;
2. universal carriers, barriers, lights, wells/water service, work surfaces, doors,
   storage, signs, and claim/state channels;
3. natural cover, cave transitions, roots, nests, rubble/spoil, tents, wagons, and
   common mechanisms;
4. institutional/industrial families required by Monastery, Mine, Prison, and Urban;
5. transform assets for dormant/layered/damaged/repaired states;
6. scale/substrate stress assets unique to Fortress, Mixed Scale, and Living/Mobile
   cases;
7. low-frequency hero pieces only after their host can already fall back truthfully.

## 6. Continuous evidence loops

No wave is only an art wave or only a code wave. Each wave runs the loops appropriate
to the capabilities it has admitted.

### 6.1 Walk-demand observatory

The checked-in 1,050-roll census is the before-state. It found:

- urban mapping was 66.3%, with Entertainment, Harborfront, and Low Ward as apparent
  gaps;
- dungeon mapping was 86.2%, with Infrastructure Hub as the major gap;
- wilderness full-site keyword mapping was only 32.8% because most results are local
  curiosities, not failed sites;
- the harness had no stable walk seed, no live region/fray geography, and no later
  site/interior synthesis.

The new observatory uses two corpora:

**Natural-frequency corpus**

- at least 12,000 deterministic requests per major census checkpoint;
- 4,000 each urban, dungeon, and wilderness;
- real world placement/fray context, realm, tier, walk source, active segment, and
  persistence state;
- travel, job, capture/re-entry, ordinary exploration, venue entry, and return visits;
- same-seed replay and a saved sample of full source receipts.

**Stratified/exhaustive corpus**

- every primary type/table row, Spice band, admitted HostProgram, transform,
  substrate mode, scale class, and materialization disposition;
- rare rows forced through the same post-roll adapter, clearly labeled as stratified;
- adversarial combinations and known retained Golden Beats;
- no weighting claim derived from the forced cohort.

For every request, record:

```text
source family / row / world / realm / fray / tier
materialization disposition
host / transform / substrate / scale mapping
semantic obligations and connections
requested asset roles and selected fallbacks
whether the request is satisfiable
whether it produced a new persistent site
unresolved reason and proposed owning document
```

Report both frequency-weighted coverage and structural row coverage. “Mapped to Golden
Site 7” is not enough; the report must say which shared host/operator answered it.

### 6.2 Synthesis batch

For every admitted coverage cell:

- generate multiple bounded candidates across changed seeds;
- run hard legality and provenance gates;
- score tactical and compositional properties;
- retain selected and rejected receipts;
- render clay, tactical, dressed/lighted, four-bearing, and context-off/on views as
  the current wave allows;
- compare to the relevant Golden ideal-art target and FFT relational grammar; and
- count exact, fallback, omitted, and unresolved asset requests.

### 6.3 Intermittent game testing

Game testing begins before the final portfolio. It asks whether the new capability is
actually reached and useful in play.

| Cadence | Test |
|---|---|
| every implementation change | focused verifier, deterministic replay, manifest/doc gates, negative control |
| every retained vignette candidate | scripted arrival → decision → interaction/exploration → exit; camera and accessibility sweep |
| every wave close | at least one natural urban, wilderness, and dungeon flow from real roll to projection where the wave supports it |
| every second wave | longer automated-player session through walk, site entry, interaction, combat when licensed, aftermath, save/load, return |
| final promotion | multi-persona marathon over the full Golden/ordinary-venue portfolio with friction reports and visual sampling |

The automated playtest remains a detection loop, not a substitute for founder taste.
It records story recap, engagement/friction, unused capabilities, dead travel, repeated
layouts, DM rescue work, camera confusion, false affordances, and unresolved asset debt.

### 6.4 PC-versus-enemy battle simulation

Battle tests are intermittent from the first playable vertical slice and mandatory at
every wave close after that.

Each admitted tactical fixture runs:

1. deployment legality and escape/retreat checks;
2. reachable-objective and interaction checks;
3. at least two approach or posture plans when the site promise calls for them;
4. cover, sight, height, hazard, route-capacity, and camera-occlusion checks;
5. representative PC/companion and enemy body envelopes;
6. multiple enemy postures: hold, advance, flank, withdraw, use objective/environment;
7. deterministic resolver simulations across intended difficulty bands;
8. save/load and SceneTray-to-BattleMap identity replay; and
9. a post-battle state pass for damage, bodies, loot, opened routes, alarms, and return.

Current zone/band combat stays authoritative until the accepted exact-cell cutover is
built and replacement-proved. Early site tests translate committed spatial facts into
the current resolver and separately verify cell geometry. Once exact-cell tactics land,
the same fixtures add path cost, occupancy, forced movement, area targeting, line of
sight, environmental actions, and AI route-choice assertions.

Balance statistics are reported, not blindly gated. Hard gates are corruption,
unreachable required goals, illegal deployment, route deadlock, false cover/LOS,
identity loss, and a map that offers no meaningful tactical decision. Win rate and
round length become gates only after the encounter declares a target difficulty.

### 6.5 Visual/taste review

Automation may reject support, clipping, occlusion, density, and obvious silhouette
failures. It cannot declare a map beautiful.

Founder review receives labeled contact sheets rather than raw capture folders:

- eight images per sheet where practical;
- feature/site/seed/scale/expression rung on every frame;
- clay, dressed, tactical, and four-bearing comparisons separated clearly;
- ideal-art reference adjacent when comparison is the question;
- negative controls explicitly marked;
- no legacy `naked` terrain presented as final terrain.

## 7. Walk modification law

The walks will probably need changes, but only when evidence names the missing contract.

Modification order:

1. **Adapter first.** Translate existing persisted facts into `VignetteRequest`.
2. **Receipt second.** Preserve fields currently rolled but discarded or under-receipted.
3. **Metadata third.** Add a typed host/transform/substrate/materialization hint when
   existing prose already implies it.
4. **Structural table change fourth.** Add or rebalance rows only when the census proves
   the story engine cannot request an important gameplay situation.
5. **Content change last.** Adam-authored table content remains propose-and-review work.

Never rewrite a walk merely to showcase new graphics. Never reject an incongruous but
legal roll in the renderer. Never force every segment to materialize a site. A walk can
license narrative-only truth, a local feature, a transform, or a full vignette.

Every walk change reruns:

- the natural-frequency and stratified coverage corpora;
- distribution deltas against the retained baseline;
- walk provenance, consumption, dealing, travel, job, capture, and save/load verifiers;
- at least one end-to-end game flow; and
- the Golden retained-composition ledger.

## 8. Multi-wave execution

Durations are planning envelopes, not promises. A wave closes on evidence, not the
calendar.

### Wave 0 — Authority, integration, and before-state

**Goal:** create one clean program surface before implementation branches.

Deliver:

- merge and retain the compact small/medium/large Golden scale portfolio;
- route Catalog, Ontology, Proof Queue, canon map, and next steps to this plan;
- create `intel/golden-site-engine-coverage.json`, the machine-readable Golden
  coverage inventory from the twelve specs;
- classify every open item as founder decision, source evidence, engine work, asset
  work, visual proof, gameplay proof, or deferred Ideal;
- preserve the 1,050-roll census as baseline and specify its successor;
- freeze first-pass `VignetteRequest`, `VignettePlan`, asset-demand, and receipt fields;
- select retained first-wave fixtures and exact negative controls.

**Gate W0:** no contradictory owner, no unhomed Golden obligation, every prior plan
routed rather than duplicated, and the first build wave can be described without a
Golden-number conditional.

**Wave-0 close — PASS, 2026-07-29.** The required outputs are:

- contract freeze: `GOLDEN-SITE-VIGNETTE-CONTRACTS.md` and
  `intel/golden-vignette-contract-v1.json`;
- owner/class inventory: `intel/golden-site-wave0-work-inventory.json`;
- first retained selectors and negative controls:
  `intel/golden-vignette-wave0-fixtures.json`;
- repository-owned before-state: `intel/walk-census.md`,
  `dev/verify-walk-census-baseline.mjs`, and
  `intel/golden-vignette-wave0-baseline.md`; and
- next implementation cut: `GOLDEN-SITE-WAVE-1-OBSERVATORY-BRIEF.md`.

The inventory homes every open category in the Catalog, founder queue, proof queue,
coverage inventory, or specialist spec. Neither contract nor fixture selectors branch
on a Golden number. Planned Guard changed-seed/adversarial receipts remain honestly
unminted. Wave 1 may now begin.

### Wave 1 — Demand observatory and semantic boundary

**Goal:** prove what real play asks for before building broadly.

Deliver:

- deterministic natural-frequency and stratified walk census harnesses;
- disposition classifier and unresolved-demand ledger;
- read-only adapters for urban, dungeon, wilderness, travel, job, capture, return, and
  ordinary venue paths;
- normalized provenance and stable seed namespaces;
- initial asset-demand report using proxies only;
- baseline full-game and combat gauntlets on current production behavior.

**Gate W1:** same seed replays; all source facts remain intact; every census request has
a disposition; unresolved demand is counted; no renderer or walk content was changed
to improve the numbers.

**Wave-1 close — PASS, 2026-07-29.** The read-only observatory retains 12,718
validated rows under stable fingerprint `vgo1-edf8cc39`: 12,000 natural-frequency
requests and 718 separate stratified cases. Every observed source leaf has an explicit
treatment; required semantic roles remain countable through proxy-only demand; all
adapters, dispositions, negative controls, selectors, and retained production
walk/game/combat/save/terrain gates pass. The 218 natural combined
`Prison / Asylum` requests remain honestly unresolved rather than defaulting to a
host. Evidence: `intel/golden-vignette-wave1-verification.md`. Wave 2 is now the next
authorized product cut.

### Wave 2 — First end-to-end compact vignette

**Goal:** prove one shared compiler with the smallest useful visible target.

Fixtures:

- `VENUE-TAVERN-01` as the small semantic/identity microfixture; and
- Site 1 `GP-SHAPE-01 shoulder-overlook through-road` as the first visual/tactical
  synthesis target.

Deliver:

- bounded candidate/score/repair loop;
- compact `MaterializationWindow`;
- macro topology, terrain, construction, tactical reservations, surfaces, asset
  resolver, projections, and complete receipt;
- proxy-first clay proof, then only the demand-backed minimum admitted assets;
- SceneTray-to-BattleMap identity;
- first intermittent arrival/play/exit and PC-versus-enemy simulations.

**Gate W2:** no seed/site-id patch; legal changed seeds; connected natural ground and
constructed threshold read as one composition; social and tactical plans both work;
four bearings remain legible; asset fallback preserves every required role.

### Wave 3 — Natural ground and transient occupation

**Goal:** generalize the engine beyond one defensive construction.

Fixtures:

- Site 2 Camp / Service;
- Site 7 Natural Lair;
- ordinary wilderness curiosities classified as local features rather than sites.

Deliver:

- feature-preserving transformations for hill, hollow, bank, gully, shelf, cave mouth,
  knoll, graded route, and localized hard break;
- camp anchoring/permanence and lair origin/body/exit grammars;
- demand-backed tents, wagon, service, cave, root, nest, cover, and material families;
- texture/ground seam pilot after geometry passes;
- wilderness walk/play/battle cohort.

**Gate W3:** features vary without losing their defining relations; no random
cell-by-cell terrain; no height cap or zipper; camp and lair use the same substrate,
route, asset, camera, and receipt systems as Guard Post.

### Wave 4 — Construction and operating circuits

**Goal:** prove that the shared engine can build institutions and work sites rather
than only terrain set pieces.

Fixtures:

- Site 4 Monastery / Commune;
- Site 5 Mine / Workshop;
- Site 6 Prison / Custody;
- Site 10 Urban Institution;
- ordinary venue fixtures selected by the Wave-1 demand curve.

Deliver:

- building-family chassis + program arrangement/state/current-scene/Spice adapters;
- repeated bays, courts, party walls, frontage, cutaway, roofs, supports, cell/custody,
  extraction/work, service and public circuits;
- construction/terrain negotiation at foundations, streets, shafts and terraces;
- institutional/industrial asset and trim/material families;
- urban and dungeon game/battle cohorts.

**Gate W4:** four unlike programs share the compiler without becoming layout reskins;
program purpose remains operational; capacity/population derive legally; multi-storey
camera behavior and circulation pass; no general d300 capability is silently lost.

### Wave 5 — History, condition, and competing control

**Goal:** make change over time causal and playable.

Fixtures:

- Site 3 Dormant / Abandoned across at least three unlike hosts;
- Site 8 Layered Control across Tavern, Mine/Prison, and one additional unlike host.

Deliver:

- clean-site-first causal history propagation;
- service/load/water/use/maintenance/event/time-derived damage, residue, repair and
  reoccupation;
- claimant, recognition, permission, schedule, property, information and front deltas;
- local through site-wide expression without forcing map growth;
- stateful asset/material variants and return-visit tests.

**Gate W5:** transform code contains no host-specific replacement generator; the host
still performs its purpose; the same site can change and replay without identity loss;
condition is causal rather than random grunge.

### Wave 6 — Scale, fortress, and substrate stress

**Goal:** prove the cases most likely to break compact materialization.

Fixtures:

- Site 9 Contested Fortress;
- Site 11 Mixed Scale / Dragon Domain;
- Site 12 Anomalous / Living / Mobile.

Deliver:

- linked compact windows with stable large-site identity;
- defensive continuity, wall routes, high approaches and switchbacks;
- body-relative apertures, routes, interaction, cover and framing;
- water/void/bog/raft/living/mobile support modes and cyclic/transforming datum;
- high-value hero/donor assets only where proxies demonstrate their need;
- four-bearing and camera-blocking stress, multi-window battles, and return flows.

**Gate W6:** “large” never becomes mandatory boring travel; height/depth survive the
compact window; scale and substrate are shared contracts, not Site-11/12 branches;
every active frontier is honest and deterministic.

### Wave 7 — Walk and game convergence

**Goal:** use accumulated evidence to make real play reliably harness the engine.

Deliver:

- rerun the full demand observatory over the admitted engine;
- make only census-justified adapter/receipt/metadata/table changes under the walk law;
- tune materialization frequency, repeat suppression, return/continuation behavior,
  and active-window purpose without flattening story variety;
- exact-cell tactical integration if and only if its independent cutover gate is ready;
- long automated-persona sessions across all walk families, combat, aftermath,
  save/load, return, and transformed sites.

**Gate W7:** improved satisfiable coverage without distribution collapse; no visual
tail wagging the story dog; ordinary venues and apparent census gaps have homes; game
flows reach and reuse Golden capabilities naturally.

### Wave 8 — Golden portfolio gauntlet and promotion

**Goal:** prove the engine, not twelve flattering seeds.

Deliver:

- all twelve cases plus ordinary Golden Venue fixtures;
- small, medium, and compact large-site-vignette targets where applicable;
- changed seeds, realms/cultures, transforms, occupancy, scale/substrate combinations,
  adversarial envelopes, context-off/on and four bearings;
- complete asset coverage/debt report;
- deterministic walk-to-site-to-battle-to-aftermath marathon;
- founder-labeled contact sheets and final proof receipts;
- updated Catalog gates and explicit next-generation backlog.

**Gate W8:** every portfolio role passes its promised proof; no result depends on a
Golden number, copied map, hand-authored rescue, silent asset substitution, or
unrecorded reroll. Remaining debt is explicitly Ideal-tier or blocks promotion.

## 9. Multi-session law

Multiple sessions are useful only after a wave freezes a shared contract and can split
work into non-overlapping outputs.

Every session brief must name:

```text
master-plan wave and gate
one bounded question or deliverable
input commit and authority documents
files/directories owned
files forbidden
machine-verifiable output
visual or gameplay evidence owed
handoff/merge order
stop condition
```

Permitted recurring lanes, when a wave benefits:

- **compiler/integration** — shared schemas, adapters, synthesis and final merge;
- **feature/program grammar** — one named host/transform/operator fixture;
- **asset foundry** — demand-backed asset family with admission evidence;
- **coverage/playtest** — read-only census, game flow, battle simulation and reports;
- **visual oracle** — renders, labeled contact sheets, critical form review.

Rules:

1. One integration session owns shared contracts and canonical planning files.
2. Parallel lanes consume a frozen schema; they do not each invent one.
3. A lane may not be launched merely because a specialist is available.
4. Research requires a named Golden gap and a routing destination.
5. Asset generation requires a demand id and fallback.
6. Visual work cannot promote mechanics; game testing cannot relax art direction.
7. Every lane returns a commit, evidence, failures, and exact merge dependency.
8. No lane begins the next wave while the current integration gate is red.

## 10. Metrics and dashboards

The program dashboard reports trends, not vanity totals.

### Coverage

- frequency-weighted and row-weighted satisfiable request rate;
- disposition shares by walk family;
- host/transform/substrate/scale coverage;
- unresolved requests by owner and player frequency;
- exact/fallback/omitted asset resolution rate;
- Golden and ordinary-venue proof state.

### Generator quality

- hard-rejection and repair rate by reason;
- structural diversity versus material-only diversity;
- route/plan count and quiet-space ratio;
- frontier honesty and repeat suppression;
- deterministic replay and receipt completeness;
- render, triangle, draw-call, memory and load budgets.

### Gameplay

- arrival-to-first-decision time;
- required objective/exit reachability;
- route and environmental-action use;
- battle rounds, stalemates, win/loss by declared difficulty;
- cover/height/hazard use and AI posture diversity;
- camera turns, occlusion failures and false affordances;
- return/backtrack friction and DM rescue interventions.

### Visual

- founder accept/revise/reject by form category;
- connected-natural versus constructed-hard-break failures;
- silhouette hierarchy, route legibility, contact and scale failures;
- four-bearing usefulness;
- asset recognizability and realm/culture/state readability;
- repeated visual pattern and prop-scatter warnings.

## 11. Stop and replan conditions

Pause the current build wave when:

- more assets are being generated than are requested by retained demand;
- a Golden number, culture, realm, seed, or source row appears in core layout logic;
- candidate repair exceeds bounded retry and begins hand-authoring exceptions;
- a walk change improves visual coverage while reducing story distribution;
- transform code duplicates host topology;
- a material or prop pass is compensating for weak macro form;
- large sites grow in acreage instead of linked semantic windows;
- battle simulations repeatedly ignore the site's supposed tactical feature;
- game tests require the DM/player to decorate, route, or rescue the map;
- camera rotation changes world truth; or
- documentation cannot name the single owner of a new fact.

## 12. Immediate Wave-2 entry queue

1. Keep the Wave-1 request, provenance, disposition, and proxy-demand surface
   read-only; do not turn the observatory into a second generator.
2. Freeze the bounded candidate/score/repair compiler cut around the retained Tavern
   identity microfixture and Guard Post shoulder-overlook visual/tactical fixture.
3. Admit only the minimum demand-backed proxy assets needed to prove macro topology,
   natural/constructed joins, route continuity, tactical reservations, camera
   bearings, and SceneTray-to-BattleMap identity.
4. Preserve the 218 combined `Prison / Asylum` requests as unresolved until their
   source semantics receive an explicit owner decision.
5. Rerun the Wave-1 corpus plus intermittent playable arrival/exit/return and
   PC-versus-enemy battle sentinels at each Wave-2 checkpoint.

Wave 2 is the current authorized product cut. Waves 3–8 remain gate-locked.
