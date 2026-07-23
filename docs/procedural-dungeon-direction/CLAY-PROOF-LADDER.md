---
type: design-study
status: ACCEPTED
created: 2026-07-21
updated: 2026-07-22
scope: cross-wave implementation proof structure
---

# Clay Proof Ladder

This document turns the accepted prototype/MVP phasing framework into a small-pass implementation shape without
authorizing a build. It exists so accepted MVP behavior and ideal feature goals do not disappear inside an eventual
multi-wave engine redesign.

## The timing answer

Do **not** wait until every design wave is complete to think about implementation structure. The remaining decisions
will make exact dependencies, schemas, estimates, and final ordering easier, so those details should remain
provisional. But the proof ladder, retained fixtures, and feature-to-pass traceability must exist now. Otherwise
“later feature goal” becomes an unowned backlog and broad design waves become broad implementation batches.

Wave 12 still owns the final dependency graph, budgets, acceptance thresholds, legacy disposition, and build
authorization. This ladder supplies smaller candidate vertical slices for Wave 12 to order; it does not pre-empt
that authority.

## Vocabulary

- **Design wave:** the preserved semantic questionnaire. It decides what Genesis should mean and do.
- **Clay fixture:** a deliberately small, deterministic canonical scenario used by production paths. It may look
  cheap, but it may not use fake geometry, parallel state, or renderer-owned mechanics.
- **Clay Pass:** one small vertical implementation unit with one primary uncertainty and an executable or visual
  gate. It may touch every necessary layer from canon through player presentation.
- **Clay stage:** a dependency-ordered group of related passes. A stage is not one giant merge or all-or-nothing
  implementation unit.
- **Golden site:** a retained representative acceptance scenario. Wave 2 accepted twelve golden sites and eight
  adversarial transition traces as the eventual portfolio; they are accumulated, not built as the first batch.
- **Feature promotion:** movement from proof prototype to playable MVP or from MVP to the mature feature goal after
  named evidence passes.

## Delivery laws

1. **One room first.** Begin with one deterministic, relatively small clay room. Do not make multi-room generation,
   site simulation, relational simulation, or all twelve golden sites prerequisites for proving the local loop.
2. **Vertical, not layer-complete.** A pass proves a player-visible behavior through its required canon, compiler,
  mechanics, renderer/EngagementLens, provider-neutral DM-seat contract, persistence, and QA seams. It does not build an entire data
   layer now and postpone proof that any of it becomes a game.
3. **One primary risk per pass.** A pass may include supporting work, but its acceptance question is singular and
   explainable. If failure could have several unrelated causes, split the pass.
4. **Retain every passed fixture.** The single room is not discarded when two rooms work. It remains the fastest
   local regression specimen. Each later fixture joins the corpus.
5. **No feature disappears between passes.** Every accepted decision family maps to an earliest proof, an MVP gate,
   an ideal feature goal, and promotion evidence in the [feature-promotion ledger](FEATURE-PROMOTION-LEDGER.md).
6. **No anonymous “later.”** A deferred goal needs a named owner/question, retained seam, and trigger. Unmapped or
   ownerless behavior blocks a phasing audit even if its semantic design wave is otherwise answered.
7. **Proof is not MVP.** Early passes may deliberately omit behavior while testing one seam. The playable MVP gate
   still includes every critical and borderline behavior in the phasing audits.
8. **Working capability is not removed by default.** Small passes extend, adapt, or place a seam around useful
   existing behavior. They do not downgrade it solely because the minimum fixture is narrower.
9. **Each pass lands independently.** A Fable work period may organize several small passes, but every pass retains
   its own spec, gate, review, coherent commit/merge, and rollback point. A batch is scheduling, not one eight-wave
   implementation bomb.
10. **Later stages cannot excuse weak earlier seams.** Multi-room and simulation passes consume the same room ids,
    receipts, viewpoint law, renderer boundary, and persistence contract proven locally; they do not introduce a
    second authority.
11. **Prove the connected BattleMat spine before module breadth.** The first dominant gate is canonical mechanics ->
    BattleMat plus mandatory EngagementLens -> DM-seat model/fallback -> persistence/recovery in the retained small room.
    Travel, camp, route branching, macro-world, transport, town, and deeper simulation grow as separately gated
    vertical modules over that spine. DM-seat prose may bridge missing breadth but cannot masquerade as committed
    mechanics or a second state owner; Gemini is one proving provider, not the product boundary.
12. **Compose BattleMap and TownTray through one spatial product.** C1A establishes stable composition/surface ids
    and diagnostics over the small room; C1H proves the first intentional real-roll battlefield before broad
    travel/town rollout. Town, wilderness, and dungeon recipes may differ, but none receives a parallel geometry,
    connector, route, reservation, provenance, or surface-art authority.
13. **Prove composition before architectural surfacing.** C1H establishes the battlefield's real structural quality
    in clay. C1I then proves one manifest-driven trim sheet over that retained geometry. Decorative detail may not
    hide weak composition, change tactics, create a second material authority, or force mature profile/channel
    breadth into the first proof.

## Stage 1 - one small retained clay room

Use the existing deterministic 5x5 `clay-room` direction as the starting fixture unless later inspection proves it
cannot exercise the required production path. Keep authored fixture inputs small; route rendered geometry,
materials, lights, mechanics, and adapters through the same owners the game uses.

The room grows through retained named scenario variants and traces. A later pass may add the opponent, hazard, or
interruption point it needs, but it does not overwrite the earlier fixture/expected trace so the faster gate
disappears.

C1A-D form the first connected physical proof and therefore precede substantial work on travel/world/town module
breadth. C1E-G then harden combat breadth, recovery, and DM language over the same core; they do not postpone proof
that a canonical physical event can reach the actual BattleMat and EngagementLens. C1H is the high-priority
composition-quality proof over that connected spine. It may begin once C1A-D's owners are stable and can run beside
independent C1E-G hardening, but it must pass before broad BattleMap/TownTray recipe rollout claims the shared
compiler works. C1I follows C1H as a separate architectural-surface proof so composition and trim-sheet failures
remain independently diagnosable; it must pass before C2M claims TownTray reuse of that surface authority.

### C1A - room truth and projection

**Primary question:** can one canonical room compile and render with exact cells, walls, one portal, one interactive
object, stable ids, a playable tabletop visual floor, and no renderer-owned mechanics?

This pass proves the room/cell identity seam, semantic-to-spatial projection, stable capture, and BattleMat shell.
It also establishes the smallest Wave 6 body seam: one retained existing-corpus citizen exposes a versioned
rules-facing BodyForm whose D&D combat-control space and registry visual-height provenance reach the same canonical
projection. This is an integration assertion, not a sprite-sizing or replacement-corpus pass. It does not require
site simulation or a complete dungeon.

### C1B - local movement and route

**Primary question:** can the player move, choose a materially different route when one exists, and cross/use the
portal through exact preview-versus-commit receipts?

This pass proves exact cells, route agency, labels, portal use, and the preview-versus-commit boundary without also
making object interaction or combat part of its primary gate. Wave 4 now requires this narrow portal to have one
canonical connection id/version and shared endpoint/state owner; per-room exits, apertures, cards, map marks, and
DM-seat facts are projections. C1B does not need the mature Connection family, but it may not prove movement through
two independently rolled half-doors or provider narration. Its retained body-aware case distinguishes normal
movement, an explicit SRD Difficult Terrain/narrow-opening result, one ordinary stated DC for consequential
uncertainty, and true blockage with lawful alternatives; renderer collision and DM prose never decide success.

### C1C - object, hazard, and custody

**Primary question:** can the player inspect and act on the object, encounter one known hazard, change physical
state, and pick up or transfer one unique object through validated receipts?

This pass proves object-card authority, hazard/object state, custody, and DM-seat fact anchors for noncombat actions.

### C1D - BattleMat/EngagementLens battle spine

**Primary question:** can BattleMat tactical truth and the mandatory EngagementLens perform one small duel without
duplicating or losing mechanics?

The lens appears for every material combat beat. Exact activation, movement, attack, hit/damage/down, target and
active-actor identity, generic truthful lens staging, and deterministic return to board truth are canonical and
visible. A small retained mixed-scale pair proves that actual occupied space, reach, base/picking, fixed-camera
projection, and provider/accessibility facts consume the same BodyForm/version without visual scale compression.
One already-supported form swap may join C1D/C2D recovery evidence when available, but does not block the basic duel.
This is the first **battle-system** gate, not merely a renderer demo.

### C1E - combat consequence breadth

**Primary question:** can the same battle pair add reaction, one condition, one area or multi-target case, and the
full crit-magnitude ladder without creating special-case or duplicate resolution?

One representative combat family now receives complete bespoke EngagementLens performance; other MVP combat verbs
retain truthful generic lens staging. This pass grows breadth over the C1D seam rather than replacing its battle
path.

### C1F - interruption and recovery

**Primary question:** do skip, pause/background, and save/load all land on the same terminal room, actor, object,
custody, event-history, and knowledge truth without replay?

Preserve composer/reading/inspection state and exact receipt/event cursors. Rich choreography and automatic
consequence briefs are not required.

### C1G - provider-neutral DM-seat consequence language

**Primary question:** can the selected supported DM model communicate the same viewpoint-legal committed consequence
without blocking, duplication, raw engine language, provider-specific state, or a dry second voice when prose is
timely, late, unavailable, or invalid?

Use the clean provider-neutral DM rail, fact-locked model prose, and several context-slotted minimum fictional
clauses. The seat exposes the same mechanics/actions, digest, tool/event schemas, and refusal contracts to every
supported provider. This pass consumes C1C-C1F receipts and recovery state; it does not create another consequence
authority or assume Gemini is the shipping boundary.

### C1H - one composed real-roll clay battlefield

**Primary question:** can one real rolled room become a tactically and visually intentional battlefield—coherent
elevation masses, typed visible connectors, a readable primary spine, a licensed landmark or dominant structural
mass, honest deployment/objective space, shaped negative space, and tactically truthful fixed-production-view
composition across governed focus/cutaway states—without
copying an authored map, moving mechanics into the renderer, or losing source provenance?

C1A first establishes stable composition and surface ids plus a greybox diagnostic view over the existing room.
C1H then introduces the smallest bounded `TacticalCompositionPlan` candidate/validation pass that can materially
improve that retained fixture. The dressed capture must preserve the clay plan's exact routes, connectors,
reservations, and ids. The exact-cell BattleMap and mandatory EngagementLens remain the battle system; map quality
does not become an excuse to postpone playable combat.

Wave 3 section 12.13 supersedes the earlier four-player-yaw acceptance assumption. C1H uses one fixed production
camera family with governed pan/zoom/focus and cutaway/ghosting. Optional nonproduction yaw diagnostics may expose
geometry defects, but player rotation and equal multi-yaw beauty are not proof obligations.

This is the high-priority first rung of the shared BattleMap/TownTray module defined in
`../BATTLEMAP-TOWNTRAY-COMPOSITION.md`. C2M must later consume the same region, route, connector, reservation,
provenance, and surface-frame contracts for its market venue. General automatic UV unwrap and stacked traversable
surfaces are not C1H prerequisites.

### C1I - one manifest-driven trim-sheet architecture pilot

**Primary question:** can one deterministic manifest-driven horizontal trim sheet route distinct base-course,
cornice, cap/nosing, and curb/retaining roles across the real C1H procedural geometry at correct physical scale,
repeat phase, corners, endpoints, occlusion ownership, and fixed-production-view readability across governed focus/
cutaway states—with a geometry-only fallback, unchanged tactics, and no unique per-map texture?

Use one material family and one stable semantic layout. Prove a diagnostic sheet before beauty art; generate or
author source strips independently and pack them deterministically with provenance; let architecture material or a
compatible material family select the visual variant while realm grade remains secondary. The first runtime path
uses full-width horizontal bands, clamped sampling, and repeat-boundary run segmentation. Base color is sufficient
for this pass because geometry normals and scene light own physical response.

C1I does not require the full architecture-material roster, physical profile-sweep breadth, roof/eave/storefront
families, normal/ORM channels, dedicated junction art, a custom atlas-repeat shader, general automatic unwrap, or
new tactical mechanics. Those remain named feature promotions in `../TRIM-SHEET-PIPELINE.md`. C2M reuses C1I's
layout, run, material, fallback, and provenance contract rather than creating a town-only trim system.

### C1J - one functional guard-room furnishing assembly

**Primary question:** can the retained C1H clay geometry become one functioning small externally supplied guard-post
room through a canonical furniture assembly—rather than a bag of attractive props—while preserving portals,
circulation, tactical truth, culture/material identity, deterministic fallback, and provider-neutral DM facts?

The clay shell, elevations, portal, reservations, and circulation commit before furniture. One bounded `RoomProgram`
then requires a guard-workstation/observation function plus only the rest, storage, light, or supply support the
selected room actually licenses. Required and optional roles, footprints, support sockets, orientation, access
faces, working clearances, focal/circulation relations, and lawful substitutions/degradation remain explicit.
Function, occupant/history evidence, tactical affordances, and optional visual dressing are separately reported.

Use the simplest honest realization for each admitted prop: a full 3D object when silhouette/interaction/occlusion
requires it, a shallow sprite extrusion for a surface-attached or strongly planar noun, and usually a primitive
assembly with a solid/procedural admitted material. The Wave 3 culture constitution and site imprint select indexed
material/palette/motif arrivals; visual assets never create the noun. Force at least one exact asset and one lawful
fallback through the same semantic slot. Include one exact container/holding allocation and one aggregate search
surface under the inherited Wave 1/2 laws. Capture clay/furnished and normal/fallback states at gameplay scale on
the target MacBook Pro and expose the same obligations, degradations, and state to the DM seat.

C1J does not build the full guard post, every common-room recipe, all twelve sites, mature clutter, broad prop art,
or universal furniture layout solving. The retained fixture earns only the recipe/micro-assemblies and realization
tiers it actually exercises.

### C1K - allowlisted dressing assertion and touched state

**Primary question:** can the provider-neutral DM seat propose one ordinary allowlisted guard-room detail, have it
atomically accepted or rejected before establishment, commit minimum mechanical state, support one real use or
mutation, and rebuild the same result without provider prose becoming a second world-state owner?

Use a tiny fixture-specific allowlist such as stool, rag, cup, loose paper, or mundane tool. Retain one accepted
proposal, one forbidden or spatially invalid proposal, one synonym/retry that cannot refill the opportunity, and one
touched-state trace such as moved, wet, exhausted, embedded, or blocked. The accepted assertion stores stable id,
class, quantity band, location/support, material/condition, ownership/access, observer knowledge, state, provenance,
and promotion tier. Pickup, use, mutation, custody, visual projection, DM/fallback narration, save/load, and revisit
must agree. Rejection must produce honest forward-only fiction without narrating success.

Wave 6 uses this same fixture to prove one sparse semantic **Stub -> Working** promotion: light contact retains only
the minimum noun/referent/owner/provenance/material delta, while actual use adds only the capabilities/state/custody
components it needs. Active projection may later compact, but the same id and material facts do not demote or reroll.

C1K does not implement the ideal contextual latent-reserve system, broad material reactions, general physics,
unbounded AI invention, or universal environmental actions. Passing one class may justify the next bounded class;
it never grants a provider unconditional authority over canon.

## Stage 2 - multi-room causality and first mode handoff

Stage 2 extends the retained room into the smallest multi-room fixture that can prove connections and consequences.
Two rooms may be enough for the first seam; add a third only when a branch, return path, or intermediate state is the
thing under test. It also returns to the retained room for the first exploration -> battle -> aftermath adapter
handoff rather than making a town or regional map the first continuity fixture.

### C2A - connection and continuity

**Primary question:** can actors, objects, labels, viewpoint knowledge, active hazards, and current state cross a
portal and return without reset or duplication?

This is the first exact portal/circulation and cross-room continuity proof. It supplies connection and return-state
evidence to the richer map/town/exploration/combat mode-continuity contract owned by P10.9, but it does not replace
the adapter-handoff proof below.

P3.5's graph-realization experiment follows rather than inflates this first seam. After the two-room connection is
real, a retained C2-era workbench fixture may freeze a small multi-room graph containing a loop, secret edge,
vertical connector, and dead end. It compares bounded deterministic candidates, input-edge-to-connector
traceability, rejected/unsatisfied evidence, and remount replay. It is an evidence fixture, not permission to make
the first continuity pass an eight-room engine batch or to admit a solver dependency automatically.

### C2B - promise and payoff

**Primary question:** can an early clue, obstruction, resource fact, or visible consequence create one stable
cross-room promise that later becomes relevant and pays off without invention or reminder clutter?

This proves the minimum promissory discovery, knowledge separation, callback identity, causal history, and
DM-seat-led projection before building a discovery network or full attention ladder. For Wave 6's cross-noun
three-tier law, the promise/concept begins as a compact stable referent and grows only the knowledge, holder,
obligation, evidence, and callback components earned by play rather than a prose essay or duplicated thread object.

### C2C - multi-room mutation

**Primary question:** can an action in one room change the legal path, hazard, object state, or opportunity in
another room, and can both rooms rebuild the same truth after interruption?

This is the first causal multi-room state-propagation gate, not yet a full operating-site simulation.

### C2D - exploration, battle, and aftermath lineage handoff

**Primary question:** can one retained room move from exploration or investigation into exact BattleMat plus
EngagementLens combat and back into aftermath through one typed, idempotent SceneLineage handoff without changing
identity, losing state or knowledge, duplicating consequences, or silently inventing spatial certainty?

Prove lineage/version identity, outgoing yield and incoming validation, single adapter ownership, cast and role
continuity, object/custody state, damage/traces/hazards, viewpoint knowledge, honestly owned spatial anchors, pending
obligations, consequence cursor, safe presentation restoration, and retry/rebuild. A simple crossfade is sufficient;
the transition animation is not canonical. Exercise the accepted precision ladder—exact cell/footprint, anchored
local relation, zone/region/route, and unresolved/reserve—with provenance-bearing placement and compaction receipts.
The pass must retain choice-changing relations and consequences while allowing meaningless grid detail to compact;
it may not silently invent certainty or erase a tactically established fact.

Semantic depth remains orthogonal to that precision and to active/site/cold ownership. A Developed recurring actor
may cross the handoff as a one-line roster projection while its sparse canonical components remain cold; a Tier-1
Stub may remain active and exact when the current action depends on it. The adapter passes ids/component refs and
deltas rather than copying monolithic actor/item/concept snapshots.

For the pre-alpha party premise, noncombat owns one main-PC/party anchor and a coarse companion formation rather than
invented exact companion coordinates. Combat derives a bounded deployment zone from the established location,
approach, and legal terrain. The one player-owned main PC and independently acting allies/sidekicks enter through
that zone and formation contract. Narrative-only companion wandering cannot change location, custody, or placement;
a validated detachment or other canonical event is required. For pre-alpha, the deterministic formation resolver
places the whole party, including the main PC, within the legal zone and persists one non-rerollable placement batch.
There is no initial deployment interaction. The mode change uses a simple orientation-preserving crossfade or
reframe plus one short fact-locked DM-seat/fallback bridge; stable landmarks, citizens, damage, and objects carry
continuity without mechanical labels or a transition card. Exact allied combat behavior remains owned by later
party/tactical questions.

Pre-alpha does not create independently advancing split-party child scenes. Tight-room participation remains inside
one party SceneLineage through `inside`, `at portal`, and `adjacent` roles. A gate, wall, elevation change, or other
exact obstruction may physically divide actors on the same BattleMat while one encounter clock and consequence
order still own all participants; that is tactical separation, not a second offscreen game. Voluntary companion
errands, child-scene advancement, view switching, and branch reconciliation remain feature goals. The active P10.9
edge case still decides how a forcibly captured or left-behind companion is stored without introducing split play.

### C2E - bounded player deployment promotion (feature goal)

**Primary question:** can the player place the main PC and optionally rearrange allies/sidekicks within the same
legal deployment zone and formation constraints without changing hostile placement, leaking hidden citizens,
rerolling the established approach, or taking direct control of allies after battle starts?

This is the explicit post-pre-alpha promotion from automatic whole-party deployment to player-authored opening
formation. Reuse C2D's candidate sets, deterministic default, placement batch, precision provenance, secret-safe
reservations, interruption/recovery, and aftermath compaction. The player edits only viewpoint-legal party choices;
declining or interrupting the placement pass retains C2D's canonical automatic result. This named pass preserves the
goal without making its extra UI and tactical-balance work a prerequisite for the first playable battle handoff.

### C2F - restrained diegetic continuity beat (visual feature goal)

**Primary question:** after stable BattleMat events and scene identities are proven, can one or two established
landmarks remain visually anchored while the incoming board resolves, persistent citizens/objects settle into their
committed cells, and the camera reaches the first actionable composition without mechanical labels, hidden-state
leaks, duplicated DM-seat explanation, or interruption/recovery drift?

This promotes C2D's simple crossfade plus DM-seat bridge into a reusable visual transition grammar. It adds camera,
timing, landmark hold, citizen/object settling, interruption, fallback, and cross-adapter visual QA over the same
SceneLineage handoff; it does not add a continuity summary or make animation canonical. The structured mechanical
information layer remains evidence-gated and is not an automatic later milestone.

### C2G - cold companion detachment and exact remount

**Primary question:** can one companion leave the active party scene through a validated forced-separation or
PC-only constrained-crossing wait receipt, remain a canonical but self-inert waiting/cold record, receive one
externally owned site/world consequence where supported, and remount as the same actor with exact location/custody,
condition, inventory, and viewpoint knowledge when the main-PC scene reaches or retrieves them?

This pass proves harsh persistent separation without implementing split-party play. The cold companion owns no
child SceneLineage, autonomous clock, hidden action, discovery, or DM-model-authored event. Ordinary consequences
owned by the companion's site/holder/world may still affect them through canonical receipts. Save/load and remount
must not duplicate, heal, relocate, reroll, or leak the companion. Independently advancing branches remain outside
pre-alpha. A voluntarily continued PC-only crossing may use the same exact last-legal-anchor state, but supplies no
general split command or companion activity.

### C2H - retained canonical foot-travel trace

**Primary question:** can one party depart from one canonical node, consume one short shared TravelWalk on foot,
retain origin/destination/route/clock/biome/event identity through save/load and DM-seat narration, then either arrive
at the same destination or turn back without teleportation, reroll, duplicate time, or SceneLineage reset?

This is an audit-and-retain pass over the existing travel seam, not authority to redesign the world. A deterministic
fixture may use the current coarse/random biome substrate during development. It must expose the current
arrival-segment time debt and preserve a stable extension seam for route profile, biome corridor, transport, and
bounded en-route choice rather than baking prose-only assumptions into the proof. If the journey stops for a short
or long rest, even the first prose-led camp presentation must pause this same cursor and invoke the retained
`restRiders`/`restRecover` owner; real time, risk/interruption, recovery, resources, riders, ledger, and DM obligation
effects occur before the same TravelWalk resumes. An explicit continue/push/camp decision surface remains a later
promotion over this minimum integration.

The visual fixture is a projection of the same real rolls onto the shared square-grid system: reusable biome cells,
elevation/depression, route/crossing cells, blockers, simple props or truthful markers, and canonical pixel
citizens. A node/edge or vector route may overlay reusable biome art only when the displayed relations remain
canonical. C2H never requests a bespoke generated image for a segment or choice.

### C2I - coherent macro-biome and route/journey separation

**Primary question:** can a small low-resolution rational macro-region deterministically refine one played corridor
without contradicting any committed node, range, river, coast, biome, bearing, or route fact, while a route's
write-once baseline remains distinct from a particular journey's computed time?

The retained fixture starts with one compact coherent region and one path from ordinary country toward a contrasting
destination such as snowy mountains. It stores seeds, macro facts, and canon deltas rather than a fully realized
world. Local refinement only adds detail inside uncertainty. Outer distortion consumes the retained geographic
`frayLevel`/`spiceTierAt` authority and the accepted `SPICE-RAISE.md`/`BREACH.md` distributions; it must not mint a
second travel- or biome-specific Fray/Spice field. Biome disorder, ordinary encounter gates, discovery-item
opportunity, and breach danger/reward remain separately tunable consumers rather than one guaranteed lockstep
scalar.

### C2J - early transport capability and road/wagon continuity

**Primary question:** can one minimal canonical possession/access fact plus rider/driver capability produce a
truthfully distinct mounted or wagon-assisted journey over the retained TravelWalk transaction without changing the
route's canon, granting unavailable transport, bypassing operator eligibility, or losing encounter and arrival
continuity?

C2J is deliberately not a full transport-asset simulation. A living mount with individual identity links to the
existing animal partial/codex citizen; a simple cart or wagon links to its retained inventory/ownership identity.
The early seam proves only access, operator capability, and the minimum typed pace/time or encounter effect the
journey actually consumes. Development may precede those effects with a fact-locked DM-seat prose plan. Custody/hire
contracts, seats/load, route compatibility, condition, feed, fatigue, stabling, injury, repair, and deeper vehicle
interaction belong to C4F unless evidence exposes an earlier hard dependency. Animal personality never moves into
a new transport schema: `NPC-PARTIALS.md` and `ANIMAL-SOCIAL.md` remain its owners.

### C2K - one bounded grid-owned travel fork (post-core pre-alpha module)

**Primary question:** can one reusable bridge/ford or road/ridge grammar create two certified grid/node routes,
show only viewpoint-known differences, commit one choice without reroll, and reconverge on the same journey while
save/load, turnback, time, exposure, and durable route truth remain exact?

The fixture uses the same grid and route owners as C2H: no arbitrary drawing, general pathfinder, fully refined
regional map, or bespoke generated scene. Both candidate corridors have stable ids and real cells/nodes; only
selected future content commits. C2K runs after the C1A-D BattleMat/EngagementLens core and proves noncombat
canonical choice -> visual projection -> DM-seat prose -> persistence before richer C4E branching.

### C2L - travel segment -> BattleMat -> changed travel segment

**Primary question:** can one enemy opportunity pause a TravelWalk, legally mount the same segment's biome,
footing, visible route features, actors, objects, custody, and knowledge on BattleMat, then return wounds, deaths,
retreat, dropped items, damage, route conditions, time, and obligations to the same cursor without reset or noun
substitution?

This is the pre-alpha-critical travel adapter trace over C2D. The DM-seat model narrates from the handoff but cannot
choose different mechanics or replace exact nouns. The visualizer uses the same grid identities before, during, and
after combat; no generic arena or prose-only wilderness fight satisfies the gate.

### C2M - bounded district -> mounted venue -> battle -> changed venue

**Primary question:** can one compact canonical district graph mount a real-roll urban venue, move the party over a
short Urban Walk or certified threshold, promote that same venue to exact BattleMat combat, fold material aftermath
back into it, process one bounded owner-driven offscreen update, and remount the changed venue without identity,
custody, damage, knowledge, clock, obligation, or route drift?

C2M is a post-core pre-alpha town module, not a whole-city generator. It reuses stable nodes/edges/thresholds,
reusable grid cells and urban props, SceneLineage, active/site/cold ownership, and F10.9b precision compaction.
Only the active venue needs exact geometry. Background population may stay pooled until material interaction roots
an individual; no venue requires bespoke generated imagery, and no unseen citizen receives continuous pathfinding
or invented activity. The accepted fixture is one canonical arrival -> Urban Walk -> market interaction -> same-
venue BattleMat battle -> aftermath -> leave/return trace. Material citizens promote; semantic venue deltas persist
while disposable geometry compacts through provenance-bearing remount; companion action/attention hooks remain
dormant until C4D.

F10.9h closed at Wave 10 section 11.94. C2M now also carries one certified cross-venue escalation when the fixture
needs it, one evidence/witness-grounded civic obligation, truthful horse/wagon/cargo custody/access at the threshold
when transport is present, one clock/condition-gated venue access case, and the symmetric district-threshold ->
TravelWalk departure. Only the active venue is exact; the chase handoff, civic consequence, transport anchor,
schedule gate, compaction, departure, and return must preserve one lineage without requiring a general city chase,
crime meter, stable ecology, exact resident schedules, or continuously live town.

### C2N - vertical and dangerous traversal transaction

**Primary question:** can one two-level canonical connection resolve a materially risky group traversal—including
editable crossing order, one fall, hanging/rescue eligibility, custody/displacement, partial completion, qualitative
known stakes, interruption, save/load, and exact remount—without flattening elevation, inventing physics, or losing
an actor/object?

Use the retained D&D falling rule for numeric damage: 1d6 Bludgeoning per 10 feet, maximum 20d6, with the applicable
Prone and liquid rules. Noise, dropped custody, lower-level displacement, hanging, pursuit position, separation, and
rescue are separately licensed outcomes rather than damage substitutions. The proof may use a stair/ladder/shaft or
one-person rope crossing; it need not implement broad flight, complex collapse, vehicles, every body scale, or
independently advancing split-party branches. Persistent forced separation consumes C2G's exact self-inert cold
record. Wave 6 additionally requires one body/geometry-constrained outcome to use the explicit SRD rule -> ordinary
stated DC for remaining uncertainty -> honest blockage order, and one bounded rescue/cooperative case to name a
primary actor, rescuer, legal helper/anchor, cohort pressure or witness, and one ineligible/self-inert participant
without granting every present noun a full turn.

### C2O - secret connection and epistemic map

**Primary question:** can one precommitted hidden connection pass through tell -> located mechanism -> opened
aperture -> viewpoint-true threshold evidence -> traversed/mapped endpoint while one caused false belief is fairly
corrected, automatic mapping records only observed topology, and every player/DM/fallback/save projection avoids
secret leakage?

This pass extends C2B's one promise/payoff into the smallest bounded Secret Network. Room opportunities may supply
the tell, corroboration, contradiction, or payoff without minting one independent secret per room. It exercises a
stable secret/discovery id, graph-bound homes, clue/payload references, viewpoint holder/belief state, progressive
reveal, honest map precision, and one optional annotation that remains a player claim rather than world truth. Broad
faction maps, planted disinformation, campaign-scale chains, and many secret families remain promotions.

## Stage 3 - small operating site simulation

Grow to the smallest site—likely several rooms—that can have a recognizable purpose and operating model. Exact room
count is chosen by obligations, not by a headline size.

### C3A - purpose, roster, repetition, and flow

**Primary question:** does a small site possess the rooms/capabilities needed for its purpose, repeat one function
without cloning, and expose one live resource/obligation flow the player can investigate or affect?

This is where functional roster, local history/current-use overlay, scoped Spice, repeated families, and one
player-facing operational handle first meet.

### C3B - time away and return

**Primary question:** can the site move active -> aggregate/cold -> active, advance a bounded clock/resource/event,
and return with one visible due consequence while preserving all exact people, items, promises, and changes?

Exercise one external boundary contract and one intervention/recovery path. Do not continuously simulate every
individual or a whole region.

### C3C - procedural contrast

**Primary question:** can the same production system produce a second materially contrasting site configuration
without special-case replacement—either another family or a different purpose/history/occupation combination?

The contrast fixture remains in the corpus. Passing one hand-tuned operating site is not enough for the playable
procedural MVP.

## Stage 4 - relational simulation

Relational behavior begins only after rooms, cross-room causality, and bounded site change share one canonical
spine.

### C4A - groups, roles, and rooted people

**Primary question:** can at least two groups occupy/contest/aid/oppose at the site, can a pooled candidate legally
root into a persistent NPC, and can one relationship/control fact change without identity drift?

Wave 6 sharpens the retained proof: an uncontacted `Guard 5` remains a cohort ordinal or provisional scene stub;
one necessary pre-contact key/witness/action delta persists as a compact world-actor/cohort exception outside
player-contact CastRoster; direct material interaction promotes the same id into a Tier-1 CastRoster Stub; actual
mechanical recurrence promotes only needed components to Working; and one already-rich/Developed noun compacts to a
roster line and remounts without lost identity, knowledge, custody, relationship, or transition truth. The semantic
Stub -> Working -> Developed axis remains separate from active/site/cold and precision projection.

### C4B - claims, custody, and invention

**Primary question:** can current possession, attributed ownership/claim, a discovered object/fact, and an approved
SceneFact promotion remain distinct and survive action, narration, and save/load?

### C4C - bounded crisis and DM obligation

**Primary question:** can one minimal CrisisChain fork/convergence coordinate existing actors, resources, hazards,
and ordinary actions while the DM's small obligation queue preserves a prior promise and retires it legally?

The crisis graph orchestrates existing owners; it does not become a second action economy or site simulator.
Wave 6's participation ledger therefore records typed primary/helper/anchor/pilot/passenger/pursuer/witness/
bystander/environmental roles, actual capability/location/action-or-resource windows, contribution receipts, and
promotion triggers. Cohorts contribute only their lawful envelope; waiting parties contribute nothing; exact actors
receive full turns only where the rules require them.

### C4D - bounded same-scene companion autonomy (feature goal; precedes split-party work)

**Primary question:** can a companion leave formation, choose and commit one personality-appropriate bounded action
inside the currently active scene, create truthful object/social/attention consequences, and return or continue
without taking control of the main PC, leaving the scene, inventing mechanics, leaking secrets, or bypassing the
player's autonomy setting?

The first retained proof is a market-scene rogue companion who may wander within the mounted scene and attempt one
certified act that can create trouble while every actor, object, clock, and consequence remains under the same
SceneLineage. The feature reuses validated actions, custody, knowledge, relationships, attention, and deterministic
receipts; the DM-seat model may express intent and outcome but cannot commit the act. The exact risk ceiling, hard red lines,
notice/intervention law, and same-scene attention boundary are accepted at Wave 10 section 11.77: certified actions
obey `Off`/`Cautious`/`Characterful`, player-owned risk ceilings and hard red lines; perceptible interruptible acts
receive readable attempts; governed focus does not create a second view or repeated camera theft. Waves 6-7 still
own personality/action scoring and behavior breadth. C4D must be proved before any independently advancing
split-party pass is scheduled.

### C4E - specialized travel assemblers over the retained contract (feature goal)

**Primary question:** can wilderness-foot, mounted, road, and vehicle travel gain genuinely different segment
families, probability gates, choices, route conditions, and audiovisual presentation while continuing to emit the
same canonical TravelWalk/SceneLineage, ownership, time, consequence, save, and arrival contracts proved at C2H-L?

This promotion may add richer road topology, junctions, traffic and faction control, per-mode content assemblers,
and selected refined physical forks that reconverge or legally promote a destination. It must not fork four
independent persistence or canon systems. The promotion fires when the retained shared compiler produces correct
but materially repetitive or implausible mode play, not merely because separate generators sound more complete.
It may also promote prose-led rests into explicit day-boundary continue/push/camp choices while continuing to call
the existing rest owner rather than creating travel-specific recovery mechanics.

### C4F - horse and wagon expansion over retained animal and inventory owners (feature goal)

**Primary question:** can horses, draft teams, carts, and wagons gain the specific custody, hire, capacity,
condition, upkeep, route-compatibility, and interaction rules that play has demonstrated they need without replacing
the existing animal citizen, pet/companion, inventory, ownership, route, or TravelWalk authorities?

An ordinary domesticated horse uses `NPC-PARTIALS.md` and `ANIMAL-SOCIAL.md` for kind, tell, need, attitude, care,
home, witness knowledge, recurring presence, and promotion. It does not pass the `MONSTER-PARLEY.md` anomaly gate
merely to carry a rider, though unusual recruited creatures may continue through that existing pet path. Vehicles
extend retained item/ownership identities. C4F adds transport-specific fields only as their mechanics become real;
it does not target full independent simulation for every mount or vehicle. The promotion fires after C2J proves the
minimal capability seam and actual play identifies which richer distinctions earn their cost.

### C4G - optional generated scene enrichment over canonical grid/node truth (feature candidate)

**Primary question:** if image generation later becomes sufficiently cheap, fast, deterministic, safe, and
available, can it enrich a travel or town scene without inventing geometry, replacing the playable grid/node
projection, breaking identity between turns/providers, or making offline and fallback play second-class?

The canonical grid, nodes/edges, rolls, actors, objects, routes, and mechanics exist and remain playable before the
image request. Generated biome art may serve as reusable background material, or a per-scene image may become a
non-authoritative visual layer whose failure reveals the same underlying truth. Acceptance requires bounded
latency/cost, cache and seed/identity behavior, rights and safety policy, provider-independent fallback, viewpoint
secrecy, and comparison against the retained grid capture. C4G is not a pre-alpha dependency and fires only when
those external economics and quality gates become demonstrably practical.

## Stage 5 / C5 - grow the retained portfolio

Only after C1-C4 work should Genesis deliberately grow toward Wave 2's accepted **twelve golden sites**, **eight
adversarial transition traces**, and deterministic/batch/human proof layers. Add sites incrementally in risk order,
not as a single content or engine batch. Each new site should justify itself by covering a dimension the current
corpus lacks: size, purpose, operating state, supply model, group conflict, scale, Spice, or non-institutional form.

Wave 6 overlays—not duplicates—this portfolio with BodyForm/actual-scale, typed capacity, SRD/DC/blocked crossing,
builder-domain mismatch, wait/reunion, cohort-to-CastRoster, three-tier sparse noun/compaction, supported carrier/
form interruption, cooperative rescue, provider/accessibility/recovery, and Mac storage/context/performance risks.
Admit the smallest diagnosable fixture for an uncovered risk; do not require an exhaustive Cartesian matrix.

The twelve-site portfolio is an eventual representative acceptance set, not the first implementation milestone.
The original accepted list and pass semantics remain in
[Wave 2's closure record](wave-02/06-sweep-and-closure.md#recommended-minimum-wave-2-design-corpus).

## Small-pass batching in Fable

A Fable planning/build window may queue several passes when their specs are settled. Organize them in dependency
order and parallelize only independent work, but keep these boundaries:

- one pass brief and one primary acceptance question;
- explicit inputs/outputs and touched owners;
- proportional deterministic/visual evidence;
- independent review and coherent landing;
- corpus fixture retained after landing;
- ledger status updated before the next dependent pass; and
- no claim that a design wave or feature goal is built because one supporting pass is green.

This permits fast batches without recreating an eight-wave total-engine redesign.

## What remains provisional

Exact schemas, file seams, pass estimates, numeric budgets, final pass count, later golden-site order, and which
passes may safely run in parallel remain provisional until their owning questions and code audits are complete.
Waves 3-9 will add or refine Clay Passes rather than being translated wholesale into implementation projects. Wave
11 still owns the workbench/debugger/corpus production design; Wave 12 consolidates the final authorized build plan.

## Pass additions from the Waves 7-9/11-12 records (2026-07-22 Fable canon pass)

**ALL FIVE ADDITIONS ARE NOW BOUND** — every owning wave was swept and explicitly closed at
the 2026-07-22/23 founder-review session (W7 §16.7 · W8 §17.7 · W9 §18.7 · W11 §19.7 · W12
§20.7). Original pending language preserved below with per-item binding notes:

- **F8.1 "the breakable door"** — one retained mutation-spine pass between C1C and C2C (break/
  burn on one door + one column: action → MutationOp → MaterialProfile → states → connection
  delta / support stub → debris → tells → lens → save/remount → honest refusal). Fills the
  Wave 3 ledger cell "first destructible proof owner to be reconciled with Wave 8."
  **BOUND 2026-07-22 — Wave 8 closed at §17.7; this addition is no longer pending.** Adam's
  F8.2 (wave-08 §17.6) additionally schedules a consolidated enumeration pass over this whole
  ladder at the Wave 12 consolidation window.
- **Wave 7 tactical-archetype variants** — named scenario variants over C1D/C1E/C2C/C2N (open
  assault, chokepoint, elevation, hazard, stealth-open, retreat/pursuit, parley pivot, rescue
  crisis, creative action, honest failure, mixed scale, replay) accumulated by uncovered risk.
  **BOUND 2026-07-22 — Wave 7 closed at §16.7; this addition is no longer pending.**
- **Wave 9 soak traces** — long-session card/motif/cadence traces riding C2B/C4C and the
  state-hygiene harness (deferred promise, forced delivery, callback lifecycle, invalid play,
  quiet session, compaction survival).
  **BOUND 2026-07-22 — Wave 9 closed at §18.7; this addition is no longer pending.** The
  closure's both-media rider adds targeted scenario fixtures beside the soaks; the four
  carded-DM pitfalls (steered-feel, nagging, dryness, simultaneity) are named measurement
  targets.
- **Wave 11 first workbench pass** — Explain panel + WHY-ledger + sandbox over C1A artifacts;
  autonomy-graduation drills on existing staged lanes.
  **BOUND 2026-07-22 — Wave 11 closed at §19.7; this addition is no longer pending.**
- **F12.1 storage-engine bakeoff fixture** — the reserved Wave 6 codec measurement, run beside
  C3B on the Mac target (vetoes first, transparent comparison after).
  **BOUND 2026-07-22/23 — Wave 12 closed at §20.7; this addition is no longer pending.**

None of these change existing pass definitions; retained fixtures stay retained.
