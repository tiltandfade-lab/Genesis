# ARCHITECTURE CLAYROOM FORM LADDER

Status: **ACTIVE PREREQUISITE — Wave 2 Guard/Tavern visual promotion is paused**

Date: 2026-07-29

## Why this gate exists

The first Wave 2 Guard Post proved that the terrain chassis can carry a coherent shoulder,
through-road, flank, and useful height. It did **not** prove architecture. The engine supplied
structure envelopes while the renderer improvised walls, slabs, posts, parapets, and the road
barrier. The resulting object was mechanically counted but visually incoherent.

The terrain program succeeded only after it built and reviewed a broad vocabulary of terrain
forms before asking a procedural roller to mutate them. Architecture now follows the same method:

1. build unlike forms in neutral clay;
2. review them as buildings and battle spaces;
3. retain the relationships that repeatedly make the forms legible;
4. encode those relationships as assemblies, constraints, and bounded mutations; and
5. only then let Golden-site synthesis select and transform them.

The target is FFT economy with modern silhouette and contact quality: broad continuous planes,
deep openings, readable roofs, causal supports, useful vertical circulation, and sparse
silhouette-critical detail. Masonry units, shingles, framing infill, cracks, grime, and most
construction rhythm remain material/trim work.

## Failure exposed by the first Guard Post

- `structure.role + footprint + storeys` is not a building plan.
- A renderer branch named `guardroom` is still renderer-authored architecture.
- An axis-aligned beam placed over a diagonal road is not a controlled threshold.
- Independent boxes do not establish wall continuity, room volume, opening depth, support,
  circulation, roof drainage, or a believable construction sequence.
- Compiler tests that count structures cannot substitute for a visual form gate.

Wave 2's mechanical compiler evidence remains useful, but its architecture visual status is RED.

## Ownership boundary

### Engine owns

- local building frame and relation to road/terrain;
- primary mass sentence and program topology;
- foundation/plinth footprints and bearing datums;
- continuous wall runs, thickness, endpoints, corners, and explicit omissions;
- true opening reservations and their jamb/head/sill/reveal geometry;
- floor, deck, roof, parapet, and wall-walk surfaces;
- posts, beams, braces, piers, and their support/load relations;
- stairs, landings, ramps, and their lower/upper destinations;
- threshold tangent/normal, clear passage, barrier pivot, and open/closed transform;
- condition changes tied to a structural cause;
- cutaway groups and the members a bearing may hide or ghost;
- material roles, access promises, cover promises, and stable ids; and
- validation, rejection reasons, fallback, and receipt.

### Renderer owns

- projection of declared primitive geometry;
- material/shader execution;
- shadows, AO/contact treatment, and diagnostic overlays;
- deterministic bearing-dependent visibility from declared cutaway groups; and
- capture.

The renderer may not decide that a footprint “looks like” a tower and add setbacks, or decide that
a guardroom needs a wall, pier, roof, or lintel. If a visible member is not in the engine plan, it
does not exist.

## Existing asset box — use it, do not confuse it with the chassis

Genesis already has two useful asset sources:

1. the engine-owned procedural kit in `src/ui/theater-procedural-kit.js`; and
2. normalized approved donor models in `assets/models-normalized/meshy-genesis/`, loaded through
   `src/ui/theater-donor.js`.

They enter an architecture plan through typed `assetSockets[]`. A socket declares owner member,
mount transform, allowed catalog categories/slugs, semantic purpose, collision/cover authority,
state owner, material context, and a primitive fallback. The renderer may resolve and project the
requested asset, but may not invent the socket or move it to a more attractive location.

The chassis must still pass when optional assets are hidden. Assets may sharpen construction
identity, causal history, operation, cover, or interaction; they may not rescue incoherent massing.

### Engine-owned procedural kit uses

| Kit family | Architecture use |
|---|---|
| beam/post/brace primitives plus brackets, gussets, plates, caps, wedges, feet | structural connective tissue at declared load and repair nodes |
| hinge, latch, pin, bearing block, crank, pulley, counterweight paths | doors, shutters, boom gates, hoists, and other real mechanisms |
| rope/chain paths | declared tension, suspension, closure, or lifting routes |
| barrier recipe | checkpoint mechanism projected into a road-threshold frame |
| containers and cargo racks | service/store sockets after the form passes unfurnished |
| sign, banner, paper, decal | surface media only; never structural identity |
| condition/access/occupancy state recipes | visible mutations driven by independent canonical axes |

### Approved Meshy runtime donors relevant to this ladder

| Runtime slug | First licensed sockets |
|---|---|
| `alarm-bell-yoke` | checkpoint, gatehouse, tower signal station |
| `movable-timber-barricade` | secondary route denial and half-cover; **not** the main road boom |
| `chevaux-de-frise` | portable anti-charge denial outside committed passage |
| `gabion-stone-basket` | retaining/repair/field-defense node with declared cover |
| `wattle-screen` | shelter/service/privacy edge; not a load-bearing wall |
| `timber-repair-brace` | causal wall/post repair node |
| `compact-field-forge` | workshop operating socket after the workshop volume reads in clay |
| `camp-kitchen-stores` | shelter/service or guard supply socket after circulation is reserved |
| `public-notice-signal-board` | checkpoint/market civic information edge |
| `wall-flame-sconce` | declared wall/light mount; light truth remains engine-owned |
| `archive-lectern` | institutional/market records socket after program topology is proven |
| `hand-windlass` | workshop lifting/service bay with a declared operator side and load route |
| `market-stall-chassis` | market exchange bay after the hall passes unfurnished |
| `beacon-signal-fire-basket` | tower crown or signal platform with engine-owned light truth |

### The wider Meshy inventory is real, even when it is not yet a citizen

Runtime citizenship is an approval and delivery state. It is **not** the asset inventory.
`batch-production-manifest.csv` contains a 300-row production slate, but those rows also do not all
mean “a GLB exists.” The adjudicated conventional archive contains **31 real GLB families**:
18 runtime citizens plus 13 generated non-citizens. The architecture engine therefore publishes
four separate states:

| State | Current census | Meaning |
|---|---:|---|
| normalized runtime citizen | 18 families | may load through `TheaterDonor` now |
| generated + adjudicated, not a citizen | 13 conventional families | real GLB exists; requires cleanup, normalization, sockets, LODs, and citizenship |
| processed connective candidate, not a citizen | 12 `CP` families | cleaned structural donor exists; requires runtime-pack and assembly admission |
| planned manifest row only | 268 rows at this audit | prompt/target exists; no generated geometry should be assumed |

The conventional non-citizen group is already substantial: cave mouth, handcart, ore cart, sledge,
pack frame, counterweighted road barrier, brazier, hanging lantern, mine lamp, hand lantern, two
ritual-light vessels, and a mineral/living-light cluster. The windlass, market-stall chassis, and
beacon left this group during the first architecture citizenship pass; they are counted among the
18 runtime citizens above.
The organic archive separately contains 14 generated GLBs, including root arches, tunnel ribs, nest
substrates/bowls, collapsed nests, and fungal forms; `M012-A/C` root-rib variants have processed
geometry but no runtime citizenship.

The next citizenship wave should be driven by actual form sockets, in this order:

| Candidate | First proving context | Why it should not be promoted speculatively |
|---|---|---|
| `M020-A` handcart | market/service lane or workshop yard | needs tow/park orientation, cargo socket, and footprint proof |
| `M021-A` mine ore cart | mine works or industrial cavern | needs rail/track relationship and containment collision |
| `M022-A` sledge/travois | rural transport or expedition camp | needs harness direction and a believable resting state |
| `M023-A` pack frame | market, shelter, or caravan staging | needs prop/interaction scale and lean/support ownership |
| `M069-A` brazier | gatehouse, courtyard, or civic night form | needs fire/light ownership and a safe circulation offset |
| `M070-A` hanging lantern | occupied shelter/market/night street | needs a declared beam/wall suspension point |
| `M071-A` mine work lamp | mine wall, tunnel rib, or work face | needs a mine-form surface and local light contract |
| `M072-A` portable lantern | workshop, guard desk, or camp | needs tabletop/floor mounting and pickup state |
| `M005-A` cave mouth | terrain/architecture seam proof | belongs to a terrain aperture, not a generic building socket |
| `M073-A/D`, `M074-A` | explicit ritual or living-light Golden site | should not leak supernatural identity into generic architecture |

This distinction is executable policy:

- an `available` socket may name only a normalized runtime slug;
- a `promotionCandidates[]` record may name a generated non-citizen by job id and intake state;
- a `plannedCandidates[]` record may name a manifest-only row, but never pretend it can load;
- a deterministic engine-owned fallback keeps the chassis and gameplay honest; and
- the receipt records which option loaded, which awaits promotion, and which fallback was used.

This ladder triggered the first architecture citizenship pass. `M025-A hand windlass`, `M047-A
market-stall chassis`, and `M075-A beacon` passed conservative cleanup and runtime normalization and
now load through their declared sockets. `M024-A counterweighted road barrier` remains a promotion
candidate: its silhouette is strong, but its source contains 112 open boundary edges and the
conservative fill still leaves 16; dropping open islands destroys the boom mechanism. The engine
fallback therefore remains authoritative until the donor receives a local repair or regeneration.
`M070-A hanging lantern` remains a later candidate. No runtime code silently reaches into
source-archive GLBs.

### Connective donor status

Processed connective Meshy donors (`CP001` wall end, `CP002` inline joint, `CP003/CP004` corners,
`CP006` cross junction, `CP008` window frame, `CP009` level plinth, `CP011` cutaway cap, `CP012`
corner post/pier, `CP013` shed eave, `CP015` roof bearing plate, and `CP016` ridge segment) are
valuable shape references and promotion candidates. They are not yet members of the normalized
runtime pack. The first form suite therefore proves equivalent engine-owned geometry and records
candidate bindings without making source-archive paths a runtime dependency. `CP007`, `CP017`, and
`CP018` remain rejected; `CP010` remains decomposition-only.

## Form census axes

The proof library is a matrix, not a list of façade styles.

| Axis | First required coverage |
|---|---|
| scale | infrastructure, small, medium, large, tall |
| program | control, shelter, observation, fabrication, communal/institutional, exchange, fortified passage |
| enclosure | open frame, partial shell, enclosed shell, courtyard/range, through-building |
| construction | masonry, timber frame, post-and-beam, hybrid masonry/timber, fortified |
| roof posture | flat/parapet, shed, gable; hip remains later |
| vertical posture | ground-only, raised deck, two storeys, three/four-storey punctuation |
| circulation | direct threshold, external stair, turning stair/landing, wall walk, through-passage |
| terrain relation | freestanding, embedded, retaining/terraced, road-straddling, edge/crown |
| state | intact, repaired/adapted, physically ruined while operating state remains independent |
| presentation | fixed tactical camera plus all four quarter-turn bearings and deterministic cutaway |

## First proof suite — eight forms

### AF-01 — Road checkpoint

Small infrastructure, not a building substitute. A real road ribbon publishes tangent and normal.
Two supports sit outside the clear tread and an operable beam spans on the road normal. The gate
must still read correctly when the road is diagonal.

Hard proof: `abs(dot(roadTangent, barrierAxis)) <= 0.001`; clear passage equals or exceeds the
declared road tread; posts do not occupy the passage.

### AF-02 — Roadside shelter

One-bay timber/post-and-beam shelter with a shed roof, a protected open face, a solid weather face,
and one small service enclosure. It must read as shelter rather than four sticks and a lid.

Hard proof: roof has declared high/low bearings, every corner load reaches a post or wall, and the
open face remains genuinely open.

### AF-03 — Embedded guardroom

One-storey masonry room inserted into a shoulder/plinth, with an apron threshold, deep observation
opening, partial camera-side cutaway, usable roof/deck edge, and a short stair binding datums.

Hard proof: construction visibly negotiates terrain; the room is not a freestanding cube on a pad.

### AF-04 — Workshop shed

Medium hybrid work hall: masonry service spine, timber work bay, wide goods opening, gable weather
mass, lean-to/service edge, and a clear heavy-work floor.

Hard proof: large opening has real depth and a supported lintel; roof planes meet at a ridge; the
work bay reads without furnishings.

### AF-05 — Courtyard range

Medium institutional L/U range around preserved negative space, with repeated structural bays,
covered circulation, a focal stair, and one raised destination.

Hard proof: the court remains the organizing void; circulation wraps rather than fills it; repeated
bays show rhythm without becoming a picket fence.

### AF-06 — Market hall

Medium/large open-post trading hall with broad gable roof, public ground floor, partial upper
gallery/loft, external stair, and service edge.

Hard proof: public clear-span volume remains legible; loft loads terminate in the primary frame;
the form does not collapse into a two-storey house.

### AF-07 — Gatehouse

Large fortified passage: two unequal occupied masses, a true route void, supported upper crossing,
wall walk/parapet, and vertical access. The gate controls a route because the route passes through
the construction.

Hard proof: no collision or render member closes the committed passage; upper crossing has piers;
wall walk is reachable.

### AF-08 — Watchtower / ruined state

Tall far-band punctuation, three to four storeys, with a readable former enclosure, stacked
landings, vertical route, and a physical ruin mutation that removes supported volume rather than
adding decorative jagged boxes.

Hard proof: height is not capped at two storeys; surviving load paths remain legible; “ruin” is a
physical state independent of whether the site is currently operating.

## Assembly schema

Each form publishes an `ArchitectureAssemblyPlanV1`:

```text
identity
primarySpatialSentence
programTopology
frame { origin, forward, right, up, terrain/road relation }
constructionProfile
levels[]
wallRuns[] { endpoints, base, height, thickness, openings[] }
slabsAndDecks[]
postsAndBeams[]
roofPlanesAndSpines[]
stairsAndLandings[]
defensiveEdges[]
thresholdsAndBarriers[]
conditionEdits[]
supportGraph[]
accessGraph[]
cutawayGroups[]
materialRoleBindings[]
compiledMembers[]
validationReceipt
```

`compiledMembers` is produced by the engine from the authored form plan. It is the only geometry
the renderer may project.

## Visual admission tests

Every form is captured:

- at the governed production camera;
- at all four quarter-turn bearings;
- in neutral clay with material rhythm removed;
- with a six-foot witness where scale is ambiguous;
- with openings, cutaway, and circulation unobscured; and
- on a labeled contact sheet in sets of eight.

A form passes beauty only when:

1. its building type reads in silhouette without a label;
2. its construction system reads through mass, span, opening, roof, and support;
3. planes are broad and continuous rather than per-cell chunks;
4. openings are true voids with depth;
5. roof posture and drainage direction are coherent;
6. every load visually reaches ground or a declared supporting member;
7. contact has no floating members or daylight seams;
8. height and negative space form a hierarchy;
9. all four bearings preserve a useful tactical read; and
10. material removal does not destroy the identity.

## Gameplay admission tests

- every declared occupiable level has a non-flying route or an explicit inaccessible truth;
- stairs meet both landings and retain standee clearance;
- doors/gates preserve passage width and swing/operation clearance;
- cover edges match their geometry;
- upper levels create useful, contestable positions rather than decorative unreachable roofs;
- cutaway never removes collision or canonical structure;
- approach, entrance, service route, and retreat do not overlap structural blockers;
- tall far-band masses do not permanently hide active foreground spaces; and
- two unlike tactical plans cannot pass merely because their outer footprint is similar.

## Mechanization after visual approval

The procedure does not randomize raw boxes. It mutates reviewed relationships:

```text
committed program + scale + site relation
  → eligible approved form families
  → primary mass sentence
  → bay/level graph
  → openings and circulation
  → roof/support resolution
  → terrain/road negotiation
  → construction profile
  → condition/repair transform
  → material roles
  → validation and bounded fallback
```

Allowed mutation examples:

- mirror or quarter-turn a complete form;
- vary legal bay counts and proportions within a reviewed band;
- move an opening along its owning run while preserving jamb/corner clearances;
- choose an approved stair posture that reaches the same destination;
- change roof pitch/overhang inside a family range;
- add/remove a licensed wing while preserving program topology and negative space;
- substitute construction profiles with equivalent support and access promises; and
- apply causal intact/worn/damaged/repaired/ruined state transitions.

Forbidden mutation examples:

- random box scattering;
- one independent “terrain/building” choice per grid cell;
- façade decoration used to fake a missing building type;
- arbitrary storey caps;
- road barriers without a road frame;
- roofs pasted onto unresolved wall graphs;
- openings painted onto solid walls;
- damage unconnected to load, water, impact, neglect, or repair; and
- seed-specific hero geometry.

## First bounded mutation rung — built 2026-07-30

`ArchitectureFormVariationLawV1` now proves the smallest honest procedural step over the reviewed
forms. A changed-seed request may:

- quarter-turn the complete form;
- mirror the complete form; and
- adjust its two horizontal proportion axes within reviewed bands (`x: 0.94–1.08`,
  `z: 0.96–1.06`).

The transform is applied once to the whole assembly relationship: compiled members, wall endpoints,
opening stations, level footprints, stairs, roof direction, local frame, thresholds, road vectors,
asset sockets, and board extent. Member/owner ids, support ownership, program topology, access
topology, opening purpose, asset candidates, physical state, and operating state do not change.

The road checkpoint exposed a useful family constraint. Non-uniform affine scale shears the exact
right angle between a diagonal road and its barrier. Checkpoints therefore license only complete
mirrors and quarter turns at this rung. Changing their road length/width later requires a
road-frame-aware operator that reconstructs the barrier on the new road normal.

Executable evidence:

- 4,096 plans across 256 seeds and all sixteen form families pass structural validation;
- seed replay is byte deterministic;
- adjacent seeds change the resulting assembly fingerprints in most families;
- every variant preserves member/support, program/access, opening, and asset-socket identity;
- both eight-form production capture suites load without console or resource failures; and
- every capture preserves the four-quarter-turn topology gate.

This is not yet bay-count generation. Roof-family swaps, stair-family swaps, wing addition/removal,
and condition mutations remain locked until each has reviewed sibling forms to define its legal
relationships.

## Second curated proof suite — built 2026-07-30

The first suite exposed the following Golden-program construction demands. They now exist as a
second set of curated form families in the same architecture grammar, not as a separate engine:

| Form | Relationship proved | Golden demand first served |
|---|---|---|
| AF-09 party-wall frontage stack | two or three owned narrow buildings share party walls while retaining separate thresholds, roofs, service backs, and upper routes | Urban Institution and ordinary shop/tavern/home |
| AF-10 keeper-and-cell block | keeper oversight, intake/property route, secure corridor, real cell apertures, service/release/escape alternatives | Prison / Custody |
| AF-11 shaft-head and hoist house | vertical void, landing, hoist bearings, cart/haul route, service platform, and safe edge | Mine / Workshop |
| AF-12 terraced communal range | construction steps with terrain across two or three datums while court/procession/service circulation stays continuous | Monastery / Commune |
| AF-13 bridgehouse / water-work | occupied construction spans a real void or water route with bearings, public crossing, machinery/service edge, and alternate bank access | Infrastructure, harbor/ferry, mill, anomalous support precursor |
| AF-14 inn/manor hip-roof house | non-institutional multi-room venue, hip roof, public/service thresholds, stair and usable upper floor | ordinary Hospitality/Domestic venues |
| AF-15 hillside stair street | street and buildings climb together; party walls, steps, retaining work, roof route, and service consequences share datums | Urban hillside and fortress approach |
| AF-16 great hall / longhouse | a tall single-volume interior, cross-aisle, hearth/service authority, roof truss rhythm, and contestable dais/gallery | communal, hospitality, barracks, ritual venue |

The suite added one necessary generic geometry capability: explicit engine-owned polyhedron surfaces.
AF-14 uses four actual hip-roof facets around a short ridge; the renderer merely uploads their
vertices and triangles. No inn, manor, or hip-roof special case exists in the renderer.

Visual review also rejected AF-16's first sealed exterior capture. Although structurally valid, it
hid the trusses, dais, stair, and gallery that the proof existed to demonstrate. The repaired form
uses a registered presentation cutaway: the camera-side wall is reduced to a retained stub and the
camera-side roof slope is withheld while the eave line, five complete trusses, far roof slope, two
exits, and intact physical state remain. A presentation cutaway is therefore not encoded as ruin.

Production evidence:

- eight labeled canonical captures, AF-09 through AF-16;
- zero console errors and zero failed resource responses;
- every receipt passes engine validation and reports `rendererOwnsGeometry: false`;
- vertical range is 5.08–9.19 world units, including a 9.19-unit hillside street;
- 507 compiled members across the eight forms; and
- citizen Meshy assets load only through typed sockets while non-citizens remain promotion requests.

## Promotion gate — satisfied for curated form admission

The curated-form gate required:

1. all eight first-suite forms compile entirely in the engine;
2. the renderer contains no per-building-type geometry branch for them;
3. the road checkpoint passes the tangent/normal and passage tests;
4. the suite passes engine validation and four-bearing capture;
5. the labeled sheet passes critical gameplay and beauty review;
6. at least one failed form is repaired by changing the plan/grammar rather than renderer art;
7. changed proportions or mirrored variants preserve each admitted identity; and
8. the admitted relations are extracted into the first bounded procedural form grammar.

All eight conditions now have executable and visual evidence. This admits the sixteen forms as
reviewed grammar exemplars. It does **not** yet license bay-count changes, roof-family swaps,
stair-family swaps, or free wing addition/removal; those are the next procedural architecture
operators and must be derived from these relationships rather than from random member placement.

## Roof-closure and reviewed-growth pass — 2026-07-30

The critical review found a systemic assembly defect: gable and shed planes could be structurally
counted while leaving daylight between the roof and the wall top. The grammar now records
`roofJunctions[]` and requires every roof to declare `open-frame`, `partial`, or `enclosed`.
Enclosed gables compile two profile infills; enclosed sheds/hips compile all required end and edge
partials. Validation compares the exact declared closure count to real engine-owned members.

The first discrete growth rung now exists for AF-09–AF-16. These are not random affine siblings:
each adds a named complete room, service wing, or storey, an access edge, explicit supports,
resolved enclosure, and—where selected—a presentation-only dollhouse cutaway. AF-14 adds a real
third storey and second stair; AF-15 extends the hillside frontage upward; the remaining forms add
program-specific annexes rather than generic boxes. Changed-seed replay remains deterministic.

Three Medium body profiles are now independently validated:

| Profile | Main risk guarded |
|---|---|
| upright Medium | ordinary portal, route, and stair fit |
| broad Medium | shoulder/wing-fold clearance, broad stair/ramp, larger turn |
| long Medium | body-length turns, service bays, ramps and switchbacks |

This is useful structural proof, not a claim that every growth mutation is equally beautiful.
AF-10 and AF-14 presently communicate their mutations most strongly; AF-11, AF-13, AF-15, and
AF-16 need stronger silhouette/negative-space differentiation before a broad stochastic generator
may select their growth operators.

## Battle-space posture and fantasy scale

Architecture-bearing synthesis chooses one posture before massing:

| Mode | Battlefield | Boundary |
|---|---|---|
| `dedicated-interior` | rooms, galleries, internal height, light and circulation | opaque or projection-cut shell; exterior is context |
| `exterior-architectural-precinct` | street, court, wall, roof and exterior works | complete façade with inaccessible depth |
| `causally-justified-hybrid` | named ruin, breach, court, open hall or threshold | only the exposed causal program slice |

AF-17–AF-20 add the first monumental fantasy rung: sanctuary nave, palace processional court,
arcane civic aqueduct, and star archive rotunda. They prove luxury floors, monumental glazing,
ornamental stone, civic wonder signatures, and both dedicated-interior and exterior-precinct
postures. They deliberately do not replace the small forms; the ladder now covers frontier,
domestic, civic, elite, and monumental needs.

## AF-21 — giant concourse ruin materialization window

AF-21 is not a full building or dollhouse. It is one 52×52 cropped corner of a larger dedicated
interior; the exterior is forbidden and the same concourse continues south, east, and upward. Its
highest compiled member reaches 39.92 world units. A six-foot witness reads as tiny.

The plan distinguishes two construction eras:

- giant-built walls, piers, glazing, galleries, ceremonial stairs, clock, and cropped vault;
- ten-thousand-year physical loss, fallen structural fragments, and later Medium-scale repair
  circulation.

The original giant stairs are tactical landforms. The later flights have a much narrower width and
different material role. Physical ruin and current reoccupation remain independent state axes.
Five engine-authored light sockets bind cool broken-window washes and warm occupation pools to
real supports. The daylight capture is the readable clay evidence; it is not final ruin beauty.
Broken arches/coffers, weathered material age, vegetation/debris ecology, and less regular surviving
gallery edges remain visual debt for the dressed rung.

## Modular clearance, stair seams, and support modes

Every stair now publishes:

```text
start / end / baseY / topY / width / clearanceHeight
foundationBaseY
supportMode
supportedBy[]
```

`supportMode` is `grounded-solid`, `bearing-on-lower-structure`, or
`suspended-or-bridged`. A swept corridor audit samples the complete tread width from walking surface
through required headroom and rejects unrelated walls, piers, tower masses, structural posts, or
modules. A wall crossing passes only through a real opening that clears the corridor.

Direct stair-to-stair joins use a named `stair-seam`. The lower endpoint and upper start must match
in X/Z, rise datum, and width to within `0.001`; an arbitrary platform cannot conceal a mismatch.
AF-21's later reoccupation flights now share one exact seam and no connector platform. The higher
flight is `grounded-solid`, and every step body reaches the concourse-floor foundation datum rather
than beginning in midair.

New procedural candidates use strict clearance. The palace proof and AF-21 currently pass with zero
stair conflicts. Older exemplars retain an audit-only collision census instead of being silently
grandfathered; that census is cleanup debt, and those forms cannot become strict generator
candidates until repaired.

Executable evidence after this pass:

- architecture ladder: 65 checks passed, zero failures;
- 4,096 bounded variants retain structural validity;
- all eight reviewed growth plans validate;
- AF-21 has 191 engine-owned visible/physical members, four stairs, two body-clearance envelopes,
  five supported light sockets, and zero strict stair-clearance conflicts; and
- the Wave 2 shared compiler/battle simulation remains a separate 54-check gate.

## Preservation roles and rejected machinery — 2026-07-30

A later proof does not erase an earlier form. `ARCHITECTURE_FORM_PROJECTION_ROLES`
records projection-scoped admission:

- AF-01–AF-16 are both `battle-window-capable` and
  `miniature-overview-capable`;
- AF-18 and AF-19 additionally retain miniature/overview use;
- monumental interiors and AF-21 remain battle-window vocabulary; and
- future forms add roles rather than replacing this registry.

“Miniature overview” includes TownTray, overworld settlement, neighborhood, estate,
compound, campus, and fortress-overview maps. A form can therefore be too complete or
too small for a dedicated battle interior and still be exactly right as an abstracted
district object.

`ARCHITECTURE_REJECTED_MACHINERY_REGISTRY` retains six named negative controls:
independent member scatter, uniform affine growth, roof daylight gaps, arbitrary stair
connector platforms, unsupported upper stairs, and presentation-hidden collisions.
Every row names its failure and retained evidence and sets
`productionSelectable:false`. Rejection removes a default/candidate privilege; it does
not delete the evidence or generic machinery.

The compact source-controlled visual record is
`../Reference/Architecture-Proof-Archive/`. The much larger local capture history may
be cleaned after close without losing the labeled proof sequence, variant/growth
sheets, or AF-21 stair before/after comparison.
