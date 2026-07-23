---
type: design-study
status: ACCEPTED DIRECTION; IMPLEMENTATION UNAUTHORIZED
created: 2026-07-23
owner: this file (the golden-site structure/material kit catalog and the Guard Post site brief)
authority: subordinate to `ART-DIRECTION-CANON.md` (Adam's verbatim rulings),
  `GRAPHICS-CONVERGENCE-CHARTER.md` (graphics law), `canon/PRODUCT-SCOPE.md` (scope tiers) and
  `procedural-dungeon-direction/CLAY-PROOF-LADDER.md` (clay-pass ids). Gated by
  `CLAYROOM-RESET-LADDER.md`. Routes detail to `BATTLEMAP-TOWNTRAY-COMPOSITION.md` (composition),
  `TRIM-SHEET-PIPELINE.md` (trim), `MATERIAL-LANE.md` (material authoring), `PLACE-GEN.md` (place
  generation), `MODEL-GRAMMAR.md` / `BLENDER-MODEL-SPEC.md` (geometry contracts).
sources: Desktop working packet, folded into the repository 2026-07-23 and left intact on Desktop —
  `~/Desktop/Genesis Golden Sites - Structure and Material Catalog.md`;
  `~/Desktop/Genesis FFT Guard Post Study/` (README, analysis/*, historical-reference/*).
  The Desktop packet is PROPOSED SOURCE MATERIAL, not canon by itself; this file is the reconciled
  repository home for what it proposes.
---

# Golden Sites — structure/material catalog and the Guard Post brief

Wave 2 accepted **twelve golden sites** as the eventual representative acceptance portfolio
(CLAY-PROOF-LADDER "Vocabulary"). They are accumulated, not built as a first batch. This file is
where a golden site's *structure kit*, *material kit*, and *relational composition brief* live, so
that no site invents a parallel authority for geometry, materials, trim, composition, or clay gates.

**Golden site 1 is the Guard Post.** Founder direction (wave-11 §19.6.6): the next big production
waves are a geometry pass and a texture pass, targeting "golden site 1 (the guard's post) looking
decent across procedural configurations" — with "we will clayroom for a while" first.

## Entry gate — this file may not start

Guard Post 1 may not begin its real composition pass until the
[Clayroom Reset Ladder](CLAYROOM-RESET-LADDER.md) CL-R0…CL-R6 gate passes. The reason is a scope
protection, not ceremony: the Guard Post must prove **site composition** — road, terrain, defended
threshold, observation, negative space, cultural construction — and must not be spent rediscovering
whether a wall corner closes, a trim band maps, a sprite keeps its colour, or a light profile can be
tuned. **CL-R0 is BUILT (2026-07-23); CL-R1…CL-R6 are not.**

## Precedence and reconciliation notes

Reconciled against current canon on fold-in. **No conflict was found between the Desktop packet and
any current canonical ruling.** Three places where the packet needed *routing* rather than adoption:

1. **Trim.** The packet's `genesis-architecture-core-h6-v1` six-band layout is a concrete realization
   of the contract [TRIM-SHEET-PIPELINE.md](TRIM-SHEET-PIPELINE.md) §14 already accepted (Option B
   across T10.1-T10.5). It is recorded there as a proposed v1 layout, not re-owned here.
2. **Material authoring.** Material Maker 1.3 seed graphs, the custom-node library, mutation lineage,
   and export/receipt contracts belong to [MATERIAL-LANE.md](MATERIAL-LANE.md), which already owns
   the lane and carries Adam's stopping-point checklist. The Guard Post's *parent-seed roster* is
   listed below as a consumer, with authoring authority left where it is.
3. **Composition.** Region/route/reservation/provenance/surface-frame contracts belong to
   [BATTLEMAP-TOWNTRAY-COMPOSITION.md](BATTLEMAP-TOWNTRAY-COMPOSITION.md) (the C1H owner). The FFT
   relational grammar below supplies *taste rules and anti-rules* over that compiler; it does not
   create a second geometry or reservation authority.

## THE FFT BOUNDARY (binding)

The FFT work is a **relational shape-grammar study** — comparative map morphology and grammar
induction. It is **not** authorization to copy authored FFT maps.

> observed spatial relationship → Genesis table prose → typed grammar obligation → bounded
> deterministic solver → procedural structure/material realization → replay and visual QA

It must **never** mean one-to-one layout conversion, mesh reconstruction for shipping, or copying
FFT's authored maps. Genesis learns *why* the maps compose well, then generates new sites from its
own canonical facts.

Production boundary, restated from the study's own front matter: public screenshots and community
documentation are **reference evidence only**; open-source inspection tools remain under their own
licenses; **no FFT mesh, texture, map, or other copyrighted game asset may become a Genesis
production asset**; no unauthorized ISO or raw game-data redistribution. If raw map inspection ever
becomes necessary, Adam supplies his own lawful disc dump privately, and it is never committed or
redistributed.

## Import audit — what was NOT vendored, and why

The Desktop study directory is ~349 MB. Per the repository's LFS posture, the attribution law
([ATTRIBUTION.md](ATTRIBUTION.md)), and actual runtime need, **nothing binary was imported.** The
written specifications were the priority and are what landed.

| Desktop asset | Disposition | Reason |
|---|---|---|
| `maps/five-angle/` (121-map, five-view corpus), `maps/existing-screenshots/` | **NOT imported** | Copyrighted game screenshots. Reference evidence only; no production or runtime need. Never a Genesis asset. |
| `downloads/` (original public archives) | **NOT imported** | Same provenance; retained on Desktop as the study's own audit trail. |
| `tools/GaneshaDx`, `tools/heretic`, `tools/libfft` | **NOT imported** | Third-party open-source tools under their own licenses; inspection-time only, zero runtime need. Vendoring would create an unowned license surface. |
| `material-maker-1.3/source/` (read-only clone of MM tag `1.3`, commit `1a86d739…`) | **NOT imported** | An entire third-party application source tree. MATERIAL-LANE already proves MM 1.3 headless export by shelling out to the installed app; the pin is recorded as a *version + commit* fact, not a vendored tree. |
| `historical-reference/**` images (lanes A/B/C, technical plans, contact sheets) | **NOT imported** | Mixed CC BY / CC BY-SA / public-domain, each with per-image attribution obligations. They inform internal visual direction only; importing them would put attribution obligations into the shipping repo for no runtime benefit. Their **source ledger is summarized below** so provenance survives without the bytes. |
| `analysis/contact-sheets/`, `analysis/FFT-GUARD-POST-COHORT-OVERVIEW.png` | **NOT imported** | Derived from the copyrighted corpus. |
| The twelve written specification documents | **FOLDED** (this file + the routing above) | Genesis-authored prose; the actual deliverable. |

**Historical-reference provenance, retained without the bytes.** Three culturally coherent lanes were
gathered: **Lane A**, a Roman-British border fortlet family (Milecastle 48 / Poltross Burn plan and
photographs; Vindolanda reconstructions) — Wikimedia, CC BY 3.0 and CC BY-SA 2.0/3.0/4.0. **Lane B**,
an Iberian medieval *atalaya* (Navapalos, Soria) — Wikimedia, CC BY-SA 3.0 ES / 4.0. **Lane C**, a
Central European Alpine route-control gate (Altfinstermünz, a territorial toll and border fortress
from about 1470) — Wikimedia, CC BY-SA 3.0 / 3.0 AT, plus one public-domain Merian-tradition view.
**Technical plans**: gatehouse plans from A. Hamilton Thompson, *Military Architecture in England
During the Middle Ages* (1912), via Project Gutenberg (public-domain source, Gutenberg terms), and a
CC BY-SA 4.0 Wetheral gatehouse plan. Full per-image ledger:
`~/Desktop/Genesis FFT Guard Post Study/historical-reference/SOURCE-LEDGER.md`.

**Before any of those images is copied, modified, distributed, embedded, used as a texture, or used
in promotional material, its exact license and attribution requirements must be reviewed for that
use.** The safe Genesis production path remains original procedural geometry and original materials.

Lane warnings worth keeping: an *atalaya* is a seeing/signalling object — excellent evidence for
lookout posture, heavy masonry, sparse openings, and distance readability, but **not** evidence that
a road passes through or beside an occupied checkpoint, so it is not a valid Guard Post 1 topology.
And maintained-overgrowth presentation must not copy the failed roofs, unsafe edges, blocked access,
or wholesale collapse visible in surviving monuments: reference damage teaches chronological layers;
the operating Guard Post shows clearing, drainage, weatherproofing, and concentrated recent repair.

## The three-way boundary (table / engine / renderer)

Restated from [CLAYROOM-RESET-LADDER.md](CLAYROOM-RESET-LADDER.md), because every catalog entry below
must declare which column it lands in.

| Table/catalog data | Deterministic engine roller | Renderer/tool |
|---|---|---|
| structure family, corner/end profile, connector type, material family, surface role, light semantic, renderer recipe id, fixture class, culture construction choice, condition/history fact | coordinates, splines/runs, tier membership, connectors, sockets, transforms, cluster members, bounded candidates, run segmentation, join resolution, UV phase, socket matching, light placement from mounts, seed variation, validation/scoring, candidate count, rejection, fallback selection, the selected plan | mesh tessellation, profile extrusion, UV projection, material sampling, deterministic condition masks, LOD, cutaway projection, visual microvariation hashed from stable ids, diagnostics, preview, measurement, capture |

**Meaning is rolled first; geometry cannot invent it.** The renderer projects committed plans and
performs no independent world-shaping roll — no independent culture roll, no independent overgrowth
roll.

## Seed and reproducibility law (binding)

Every Guard Post — and every golden site — must satisfy all of:

1. **Reproducible under a seed.** The same seed plus pinned recipe versions replays a
   byte-equivalent canonical plan.
2. **Supports changed landscape/road/post layouts.** Different seeds yield *different legal
   compositions*, varying only licensed fields; retained rejected seeds stay rejected for named
   causes.
3. **Rejects or falls back from broken candidates.** Failure yields a **typed rejection/fallback
   receipt**, never broken geometry, and follows a declared simplification ladder.
4. **No seed-specific branch, hand-placed coordinate, or special-case geometry patch** — including
   for the retained golden seed, an accepted capture, or a culture id.
5. Generation is deterministic, versioned, bounded, replayable, and persistent after commitment;
   ids and receipts are committed with the capsule.

## FFT-derived relational grammar (proposed taste constitution)

Ten recurring rules induced from a ten-map cohort with five matched views per map. These are the
**current design defaults**, awaiting Adam's promotion to a hard taste constitution or his named
exceptions (GUARD-POST-LOCK-AUDIT: "strong study findings awaiting promotion").

1. **One primary spatial sentence.** Every site recipe exposes a one-sentence primary spatial
   relation before detail generation. A scene is not "a collection of medieval things."
2. **Broad masses before cells.** Construct two to four meaningful ground/elevation masses, then
   tessellate and dress. Reject elevation that reads as independent cell noise. (Range is a
   hypothesis to calibrate in clay, not a universal law.)
3. **Architecture occupies a transition.** A Guard Post anchor must control a committed transition or
   observation relation. Reject a post that merely occupies available flat space.
4. **Elevation has hierarchy.** Prefer one dominant elevation mass plus one supporting mass; penalize
   equal-area/equal-height terraces that erase hierarchy unless a table-authored archetype calls for
   symmetry.
5. **Roads are regions, not centerlines.** Generate the primary route as a corridor region with width
   and apron states, not a single-cell path painted after terrain.
6. **Rocks are relational clusters.** Every major cluster declares a relation: `tier-edge`,
   `outside-bend`, `boundary-cap`, `route-frame`, `cover-anchor`, or `landmark`. Decorative
   micro-rocks may follow material breakup but cannot replace cluster grammar.
7. **Quiet ground is active composition.** Reserve quiet-ground regions before incidental dressing;
   penalize dressing that destroys the silhouette or competes with the primary spatial sentence.
8. **Composed edges imply a larger world.** Derive the visible envelope from meaningful masses and
   ingress/egress continuations, then compose clipped corners and undercut sides. No arbitrary noisy
   perimeter erosion.
9. **Sparse object count, rich surface hierarchy.** Solve beauty with massing, profile, surface, and
   light before increasing prop density.
10. **Camera visibility is grammatical.** Candidate acceptance includes production-camera route,
    threshold, lookout, and standee visibility. **Cutaway is a deterministic projection of committed
    occluders, never a geometry reroll.**

Relational vocabulary (conceptual, not final schema names) — ground/elevation masses: `LOW_APPROACH`,
`ROAD_CORRIDOR`, `WORKING_TERRACE`, `UPHILL_SHOULDER`, `LOOKOUT_CROWN`, `ROCK_CLIFF_EDGE`,
`QUIET_GRASS`, `DITCH_WATER_VOID`, `NEGATIVE_SPACE_BOUNDARY`. Route events: `ENTRY_CONTINUATION`,
`BEND`, `GRADE_CHANGE`, `NARROWING`, `APRON_WIDENING`, `CONTROLLED_THRESHOLD`, `STAIR_RAMP_CLIMB`,
`EXIT_CONTINUATION`, `SECONDARY_FLANK`. Structure/terrain relations: `POST_ABUTS_SHOULDER`,
`POST_EMBEDS_IN_RETAINING_EDGE`, `POST_OVERLOOKS_ROUTE_LEG`, `GATE_STRADDLES_ROUTE`,
`WALL_TERMINATES_IN_ROCK`, `THRESHOLD_OPENS_TO_APRON`, `STAIR_BINDS_TERRACES`, `ROCK_CAPS_RISER`,
`REPAIR_BRIDGES_OLD_MASONRY`. Composition roles: `DOMINANT_MASS`, `SUPPORTING_MASS`,
`VERTICAL_PUNCTUATION`, `QUIET_FIELD`, `FOREGROUND_CUTAWAY`, `COMPOSED_EDGE`.

## `GP-SHAPE-01 — Shoulder Overlook Through-Road`

The first composition archetype. Its table-readable spatial sentence (provisional prose for testing,
**not** a new canonical table row):

> An old stone Guard Post occupies the uphill shoulder above a pass-through road. The road narrows
> where maintained retaining masonry meets a rock cut, then continues beyond the post.

**Hard obligations.** The road enters and exits through distinct legal continuations and stays
connected and traversable · a working approach/apron connects road to post threshold · the post sits
on or embeds into an uphill shoulder relation · at least one observation face has a legal sight
relation to the approach · every height delta has a typed connector or blocked-riser truth · required
workstation, container, supply, and circulation spaces remain legal · maintained overgrowth does not
block the road, door, observation station, or working clearances · retreat remains honest.

**Arrangeable.** Road straight/bent/gently climbing/switchbacked/rock-cut as the selected table row
licenses · shoulder may fall to either side · post on the inside bend, outside shoulder, or near the
narrowing so long as it still controls the route · a secondary uphill footpath/flank only when
envelope and table license it · rock clusters, short stairs, retaining walls, parapets are derived
support.

**Anti-rules.** No flat rectangular pad with a building centred on it · no per-cell independent
terrain noise · no uniformly scattered rocks or grass tufts · no road painted after terrain with no
cut, grade, edge, apron, or retaining relation · no decorative stair disconnected from the route
graph · no equal-height/equal-area terraces without a licensed symmetric archetype · no overgrowth
across operating circulation · no foreground wall that permanently hides the threshold or standees ·
**no special geometry for the retained golden seed.**

**Proposed deterministic construction sequence.** Roll meaning → resolve envelope and composed edges
→ resolve road endpoints → generate road-corridor candidates → generate broad elevation candidates
relative to the road → score post anchors → derive support (retaining, stairs/ramps, foundation
transitions, wall endpoints, rock-boundary slots) → reserve gameplay (footing, circulation,
deployment, objective, flank, cover, retreat) → assemble surfaces (frames, roles, masks, sockets, UV
scale, chronology) → project maintained overgrowth → validate the production view and derive cutaway
→ select, receipt, version, commit, persist one legal candidate. *Technically consistent with current
Genesis authority and the FFT study; Adam has not explicitly locked it as the build specification.*

## Guard Post construction — the low-poly translation

> The Guard Post is not a miniature realistic building made from hundreds of little modelled parts.
> It is a legible tactical diorama made from a few broad terrain masses, a road that is real
> geometry, continuous architectural runs, deep readable openings, and a handful of large silhouette
> pieces; the material system supplies construction rhythm and age without pretending to be geometry.

**The three-layer visual law:**

| Layer | Must carry | Must not carry |
|---|---|---|
| Low-poly geometry | silhouette, elevation, road width and grade, wall thickness, apertures, cover, route connectors, support, roof mass, collision, cutaway | modelled masonry units, roof tiles, grass blades, small cracks, surface grime |
| Material and trim | stone-unit rhythm, joints, grain, broad geological strata, restrained wear, roughness, moisture/growth affinity, declared physical scale | doors/openings, mechanical steps, fake parapets, fake collision, invented damage or repair |
| Narrative furnishing facts | work, storage, rest, readiness, supply, records, culture, history not yet needed for architectural proof | invisible blockers, invisible cover, invisible line-of-sight obstruction, invisible interaction reach |

**The scene must remain architecturally intelligible and tactically interesting in neutral clay.
Materials may strengthen the read; furnishings may not rescue it.**

**FFT-economy construction laws.** Broad masses first · every visible plane has a job · the road is a
ribbon, not paint · walls are continuous runs, not piles of blocks (masonry units live in the
material; only dressed silhouette pieces — caps, sills, thresholds, drain mouths, load-bearing
corners — become separate simple geometry) · openings have depth (a hole/reveal with wall thickness,
never a dark rectangle on a wall texture) · tactical elevation is geometric and emitted from the same
typed connector mechanics use · rocks are landmarks or supports in causal clusters, never even
scatter · grass is a quiet field supplied by the ground material · roofs are planes, not tile
collections · **the production camera is the judge** (a detail unreadable at gameplay scale is
deleted, enlarged into a proper construction feature, or moved into the material) · cutaway is a
deterministic derivative that may hide/ghost licensed occluders and cap the sections but may not
redesign the building · **no seed-specific art patch.**

**Preferred primitives.** Extruded boundary polygon · planar ribbon between two typed edge chains ·
straight or gently segmented run with a small cross-section profile · rectangular prism for beams,
posts, lintels, barrier members · wedge for a shoulder cut, buttress, or roof · two- or four-plane
roof mass · six- or eight-sided cylinder only where a round member materially matters · one- or
two-ring irregular polyhedron for rock · shared stepped mesh for tactical stairs · shallow U/V
profile for drainage · one-segment bevel only on silhouette- or contact-critical edges.

**Avoid.** A cube per tactical cell · a mesh per stone/brick/shingle/plank/grass tuft · multi-segment
bevel stacks · smooth subdivision · cylinders with more sides than the production view can
distinguish · texture-displacement silhouettes · random vertex noise on architectural runs ·
micro-triangulation or cracked-glass faceting.

**Atomic bill of materials (families, `GP-LP-*`).** Terrain and approach: composed stage, elevation
mass, shoulder cut/wedge, road ribbon. Architecture and control: post foundation, continuous wall
run, opening/aperture with reveal, threshold/barrier, lookout/observation assembly, roof mass,
retaining run, typed stair/ramp connectors, rock-cluster assembly, support member, repair member,
cutaway cap. Each family declares its low-poly emission, required parameters, and surface/material
sockets. Exact dimensions and triangle bands remain **clay-calibrated**, not locked by taste
discussion — measure in clay and changed-seed sheets.

## Cultural mutation — MVP and Ideal

> **MVP proves that culture can make the same legal Guard Post read as a different coherent
> construction tradition without changing its gameplay topology. Ideal allows culture to reshape the
> site's spatial solution and therefore requires the engine to solve and validate it again.**

**The first cultural pair (founder-confirmed 2026-07-23): Institutional Frontier Works** and
**Upland Vernacular Station**. These name original fantasy construction logics informed by
historical evidence — they are not literal Roman and Alpine cultures.

**Same-thing invariant capsule** (held constant across the paired variants): small, operating,
externally supplied checkpoint · maintained overgrown old stone, not abandonment · hill-shoulder site
with a real road narrowing · pass-through road with the same entry/exit continuations · barrier/gate
controlling the same threshold · one occupied guardroom beside the threshold · one licensed
observation position · the same workstation, storage, readiness, access, and circulation roles · the
same approach, threshold, lookout, flank, retreat, and camera obligations · the same canonical repair
event · the same weather, time, lighting, envelope, composition seed, and tactical reservations.
Working repair fixture: **recent slope-pressure and drainage repair** — the event is invariant, each
culture expresses how its builders perform it.

**MVP is not a palette swap.** Each culture differs through a correlated construction profile with at
least one shape/silhouette channel and one material/assembly channel visible at gameplay scale —
planning posture, wall system, weather/lookout silhouette, observation family, threshold assembly,
repair grammar, material-role distribution, and narrative-furnishing vocabulary. Culture A reads
**low, rectilinear, standardized, dressed-corner, measured-replacement**; Culture B reads **compact,
fitted-into-the-hill, irregular rubble with dressed stone reserved for load/wear-critical roles,
deep eave, packed-stone buttress and timber cribbing.**

A culture profile is a stable table/config row binding a coherent family — `cultureProfileId`,
`displayName`, `planningLogic`, `wallAssemblyProfile`, `roofWeatherProfile`, `openingFamily`,
`thresholdAssembly`, `lookoutAssembly`, `repairGrammar`, `materialRoleBindings`,
`furnishingRoleBindings`, `compatibilityTags`, `namedFallbackOrder`, `profileVersion`. **The row
selects compatible families; it does not contain authored coordinates.**

**Invariant in MVP:** road and mechanics route graph · entry/exit continuations and threshold
location · room and furnishing semantic roles · barrier function and usable clearances ·
reachability and observation mechanics · repair event, age, and operating condition ·
maintained-overgrowth state and physical growth rules · tactical reservations, collision promises,
cover, sight, and reach obligations. The paired fixtures use **byte-equivalent committed
`TacticalCompositionPlan` and mechanics plans**; culture-owned geometry stays inside prelicensed
support envelopes so it can never close a road, move a route, or change tactical advantage.

**Explicitly outside MVP** (deferred, not rejected): culture-specific road layouts or route graphs ·
culture changing room count/purpose · culture-specific staffing/faction/law/canonical nouns · a
courtyard, second building, tower compound, bridge complex, or full gatehouse · multiple roof or
repair families per culture · culture × realm, culture × season/weather matrices · symbolic dressing
as the primary differentiator · large prop catalogs or authored cultural set-pieces · all twelve
sites expressing both cultures.

**MVP evidence bundle:** one paired hero seed rendered as neutral clay, materialed structure,
architectural cutaway, and gameplay view with ordinary narrative furnishings hidden · six paired
changed seeds · two paired adversarial envelopes stressing slope direction, threshold orientation,
and camera occlusion · deterministic replay receipts for every fixture · one fallback capture per
culture demonstrating truthful degradation. **Eighteen generated site realizations — nine shared
inputs each expressed by both cultures — not eighteen authored maps.**

**MVP acceptance gate.** Both variants are unmistakably the same operating Guard Post; both are
culturally distinguishable at gameplay scale **without names, flags, signage, hue shifts, or a unique
decorative prop**; the distinction survives a neutral clay silhouette-and-construction view; material
projection *strengthens an already visible construction difference*; route graph, collision, tactical
reservations, interaction roles, and operating clearances remain equivalent; overgrowth obeys the same
exposure/drainage/traffic/repair logic on both systems; each culture's identity survives all changed
seeds; neither profile wins by collapsing every seed toward one layout; the renderer performs no
independent culture roll; no seed, fixture, culture id, or accepted capture receives a special-case
geometry patch; both cultures remain legible with narrative furnishings hidden, and **no invisible
furnishing changes collision, cover, sight, support, light position, or interaction reach.**

**Ideal tier** (after MVP proves the profile contract): spatial mutation — footprint proportions and
handedness, post position relative to the road edge, room adjacency and interior circulation, lookout
placement and vertical access, terrace/yard/retaining/gate composition, orthogonality versus
terrain-following construction, one-building versus small-compound realizations. **These require the
engine to generate new candidates, rerun all constraints, score, and commit a new composition plan.
They are not renderer swaps.** Also deeper material economy and craft, deeper operation and interior
expression, and cross-system expression (one culture profile across several site types, controlled
culture × realm interactions, related cultures and hybrid border construction with explicit
provenance rather than arbitrary mixing).

**Promotion law.** An Ideal feature enters the reusable culture system only after it is visible and
meaningful at gameplay scale, has an explicit canonical owner, has a comprehensible table/profile
representation, has deterministic geometry and material effects, has compatibility rules, budgets,
and a named fallback, survives changed seeds without destroying site identity, and works on a second
golden-site type without becoming a copied Guard Post motif.

## Furnishing boundary (binding — see ART-DIRECTION-CANON for the verbatim ruling)

Most furnishings remain **narrative** until architectural soundness and tactical quality are proven.
Furnishing facts may be DM-visible and world-persistent without physical models. **If a furnishing
changes collision, cover, sight, support, practical-light position, or exact interaction reach, it
must receive the smallest truthful physical proxy — invisible tactical furniture is not permitted.**
The paired cultures must therefore be legible through construction, silhouette, threshold, opening,
roof/lookout, repair, and material-role distribution **with all ordinary furnishings hidden**.
Furnishing *assembly* semantics remain C1J's (CLAY-PROOF-LADDER); a physical furnishing catalog must
not block the architectural/tactical proof.

## Material kit — Guard Post parent seeds (consumer view)

Authoring authority: [MATERIAL-LANE.md](MATERIAL-LANE.md). Material Maker **1.3**, versioned reusable
seed graphs with explicit mutation lineage (see ART-DIRECTION-CANON, 2026-07-23). The Guard Post
consumes twelve parent families:

`GP-MM-M01` old operational stone, coursed · `M02` old operational stone, local rubble · `M03`
dressed operational stone · `M04` packed road and working apron · `M05` quiet grass/soil ground ·
`M06` geological outcrop rock (visibly distinct from masonry) · `M07` structural timber · `M08`
forged iron · `M09` roof/weather family (pending the roof choice) · `M10` interior reveal and
cut-section · `M11` maintained-overgrowth response toolkit (damp, moss/lichen, crevice growth,
cleared use, repair suppression) · `M12` trim-role source strips.

Locked material headline: **maintained overgrown old/reclaimed stone** — operational paths,
threshold, observation, drainage, and clearances remain maintained; **overgrowth is condition/history,
not automatically Lost World, abandonment, culture, or realm.**

CL-R4 proves the seed **parents** and the channel routing in the Clayroom. The Guard Post proves the
selected maintained-overgrown-stone combination, road/ground relation, chronological repair story, and
cultural selection.

## Trim (consumer view)

Contract authority: [TRIM-SHEET-PIPELINE.md](TRIM-SHEET-PIPELINE.md). The Guard Post consumes the
stable six-band `genesis-architecture-core-h6-v1` layout — plain, base-course, cornice-belt,
coping-cap, stair-nosing, curb-retaining — full-width horizontal bands, independently authored source
strips, deterministic manifest-owned packing, clamped sampling, geometry-owned profiles/corners/
endpoints/occlusion, and truthful fallbacks. **Diagnostic sheet before beauty art** (CL-R5, then C1I).
First visual variants: `gp-trim-stone-institutional-v1`, `gp-trim-stone-upland-v1`, and the diagnostic
`gp-trim-debug-h6-v1`.

## Lock audit — what is founder-locked vs. working

`LOCKED` — site identity (small operating, externally supplied Guard Post) · golden form (roadside
post built into a hill shoulder) · pass-through road relationship · maintained overgrown stone, never
an abandoned ruin · procedural generation with mathematical reproducibility and legal seed variation ·
the table/engine boundary · the renderer boundary (projects committed plans, no independent
world-shaping roll) · golden-seed law (retained ordinary seed; no hand-authored map or seed-specific
branch) · separate structure/material catalogs and authorities · the FFT-like composed-diorama target
· the FFT very-low-poly construction translation · Material Maker 1.3 with saved reusable versioned
seed graphs and explicit mutation lineage · the primary spatial sentence (guardroom on the hill
shoulder beside a genuine road narrowing, gate/barrier controlling the pass-through threshold) ·
mutation phasing (construction-level MVP before spatial mutation) · the first cultural pair · the
historical-reference comparison method · the furnishing boundary.

`WORKING` (current defaults, not locked) — ground/road/rock/grass composition detail · post-placement
scoring · mass hierarchy · camera/cutaway profile · the open-top rectangular guard room as the first
component proof · the golden build order (clay relations → structure → materials → architectural
cutaway/gameplay frame → culture A/B) · Genesis-procedural-first with Kenney as semantic
scaffold/donor/fallback · the secondary route/flank question.

`OPEN` (needs a founder choice or proof evidence) — observation method (deep window, shuttered
window, slit, open watch face, …) · roof/weather cover posture · the exact recent-repair story ·
overgrowth intensity band · lighting/weather/time condition · palette/value script after
gameplay-scale material cards.

`DEFER` (do not lock by taste discussion; measure in clay and changed-seed sheets) — every numerical
parameter: dimensions, grade bands, tier ranges, wall thickness/batter, road cross-section, candidate
budgets, scoring weights, triangle bands, camera framing dimensions.

## The twelve golden sites

Guard Post is site 1 and the only one with a full brief. The remaining eleven are named in the
Desktop catalog and gain briefs only as they are reached; **the portfolio is accumulated, never a
first batch** (CLAY-PROOF-LADDER delivery law 4). No further Guard Post choice is required merely to
sketch the other eleven — the current constitution is sufficient for cross-site comparison.

## Open founder decisions before deep Guard Post specification

1. confirm `GP-SHAPE-01 — Shoulder Overlook Through-Road` as the first composition archetype;
2. confirm the FFT-derived relational rules as the first taste constitution (or name exceptions);
3. confirm the open-top interior room as the component proof;
4. confirm Genesis-procedural-first / Kenney-fallback geometry strategy;
5. choose the observation method;
6. choose the recent repair story;
7. choose the roof/weather-cover posture;
8. defer realm A/B until the locked culture proof passes;
9. populate narrative furnishing roles only as the RoomProgram needs them.

These are candidates for [canon/OPEN-QUESTIONS.md](canon/OPEN-QUESTIONS.md) Batch 2 when Adam next
takes a decision pass; they are recorded here rather than promoted, because this fold-in proposes and
Adam disposes.
