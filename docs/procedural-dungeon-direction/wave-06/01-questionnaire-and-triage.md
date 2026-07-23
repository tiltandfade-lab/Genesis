---
type: design-study
status: CLOSED
wave: 6
part: 1
legacy_sections: "15-15.8"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 6 — Full Questionnaire and First Discussion Batch

### 15 Wave 6 opening — preserve the complete bank before rulings

Wave 5 closes explicitly at section 14.9. The questionnaire advances to **Wave 6 — Creature Scale, Capacity,
Squeezing, and Party Participation**. The complete prospective/additive bank follows. Its presence is not acceptance.

#### Inherited laws Wave 6 may deepen but not silently contradict

- A canonical entity retains stable identity, aliases, lineage, relationships, custody, knowledge, and history
  across projection, grouping, form changes, vehicles, scene changes, separation, save/load, and remount. A renderer,
  provider, or temporary group label may not replace it with a new actor.
- Genesis targets **true-scale** creatures. `scaleVsHuman`/size data and canonical geometry determine presentation;
  visual compression may be an explicitly labeled fallback but cannot alter reach, occupancy, access, or tactics.
- Builder/original-use scale remains provenance. Large inhabitants receive coherent domain-scale rooms/routes and
  explicit transition architecture or a causal mismatch/adaptation; the engine may not enlarge every dungeon around
  the largest current resident or trap a dragon in a decorative boss box.
- Architecture, portals, furniture, and traversal commit canonical widths, heights, elevations, supports,
  clearances, reservations, load/capacity used by the supported slice, and endpoint truth before a body attempts to
  occupy or cross them. The body system consumes those facts rather than redrawing space.
- Capacity is typed by the activity being attempted. Comfort, operation, transit, tactical occupancy, carrying,
  concealment, riding, emergency overflow, render cost, save cost, and DM-context cost are not one universal number.
- The playable pre-alpha has one player-owned main PC, formation-bound allies outside combat, independently acting
  allies in combat, one advancing party scene, no voluntary split command, and no independently advancing off-focus
  companion scene. Forced persistent separation creates an exact self-inert cold record; externally owned events may
  affect it, but provider prose cannot advance it.
- Same-scene companion autonomy under C4D must prove itself before transactional independent split-party lineages.
  Any later split system extends the retained party/SceneLineage/cold-record seams rather than inventing a parallel
  campaign state.
- Every material traversal preserves ordered actors, objects/custody, implemented capacity/load, time, pursuit,
  partial completion, risk, recovery, and legal separation. Containment or attachment never substitutes for actor
  location.
- One entity may own multiple forms. The active form may change size, stat frame, movement, equipment compatibility,
  reveal, and rendering through an engine-owned event; identity/history/relationships do not fork. Effect-specific
  rules decide what persists, merges, drops, becomes unusable, or reverts.
- Participant, helper, witness, bystander, cohort, passenger, pursuer, rescuer, and environmental-owner roles do not
  automatically grant a full combat turn or erase mechanical contribution. Every contribution consumes a real
  capability/action/resource/window and produces canonical receipts.
- Player and provider views receive viewpoint-legal scale/access facts and honest uncertainty. They may not claim a
  creature fits, reaches, sees, hears, carries, or participates because the sprite looks small or prose wants it.
- The first no-cash Mac proof remains narrow. Full continuous body physics, arbitrary crowds, simultaneous split-
  party campaigns, every vehicle, every transformation, and the complete mixed-size corpus are evidence-triggered
  breadth rather than prototype prerequisites.

#### Physical scale, occupancy, and architecture

1. **P6.1 — canonical body/form dimensions:** What size, footprint, height, reach, mass class, posture, occupied
   volume, movement modes, and form/guise relationship are authoritative for PCs, NPCs, monsters, swarms, mounts,
   vehicles, and unusual bodies?
2. **P6.2 — capacity and co-location:** How many creatures and objects can stand, work, fight, pass, hide, ride,
   carry, or gather in a cell/zone/room/vehicle; how do comfort, functional capacity, tactical occupancy, crowding,
   and emergency overflow differ?
3. **P6.3 — squeezing, reach, and constrained movement:** How do narrow passages, low ceilings, partial openings,
   difficult footing, long bodies, large equipment, reach, opportunity, cover, and forced movement interact across
   scale without binary “fits/doesn't fit” handwaving?
4. **P6.4 — creature-scale domains:** How do sites built around dragons, giants, tiny folk, mixed populations,
   industrial machines, or vehicles allocate domain-scale rooms and transitions while remaining explorable by the
   player and coherent with original construction truth?

#### Party continuity, aggregation, and form change

5. **P6.5 — party split and regroup:** What exact events, clocks, communication limits, viewpoint rules, danger
   ownership, shared-resource access, and DM-turn protocol govern characters in different rooms, routes, vehicles,
   or realms without duplicating or forgetting them?
6. **P6.6 — CastRoster and offscreen aggregation:** Under G6.1-G6.2, when are actors individually simulated versus
   represented as groups; which identity, aliases, membership, position, condition, motive, equipment, knowledge,
   relationship, and last-transition facts can never be aggregated away?
7. **P6.7 — mounts, vehicles, carrying, and passengers:** How are rider/passenger/cargo attachment, capacity,
   boarding, dismounting, falls, forced separation, vehicle orientation, damage, and simultaneous movement stored so
   containment never substitutes for actor location?
8. **P6.8 — guises and transformations:** How do one entity's multiple forms change size, statistics, equipment,
   movement, occupancy, visibility, knowledge/reveal, and rendering while identity, history, relationships, and
   continuity remain singular?

#### Participation, presentation, and proof

9. **P6.9 — tactical and cooperative participation:** How do large groups, different scales, off-turn rescuers,
   helpers, bystanders, summons, and environmental actors contribute to initiative, checks, CrisisChains, and
   hazards without giving everyone full simulation or reducing them to decorative narration?
10. **P6.10 — scale-readable danger and access:** What tells let players judge whether a creature fits, reaches,
    sees, hears, can pursue, can be escaped, or can use an object/route; how are alternate approaches preserved for
    bodies the architecture did not primarily serve?
11. **P6.11 — visual and camera projection:** How do true scale, standee/sprite dimensions, bases, occlusion,
    elevation, large bodies, crowds, split parties, guises, and vehicles remain legible across interim and future
    renderers without compressing mechanical scale?
12. **P6.12 — Wave 6 acceptance corpus:** Which mixed-size casts, dragon domains, tiny passages, crowds, mounts,
    vehicles, transformations, party splits, offscreen intervals, rescue scenes, terminal outcomes, and captures
    prove identity continuity, spatial legality, fair participation, and bounded performance?

#### Additive Gemini-reference questions

13. **G6.1 — persistent CastRoster identity:** What must a `CastRoster` record so an individual retains stable
    identity, aliases, group membership, position/zone, condition, motive, equipment, knowledge, relationship, and
    last valid transition through party splits, vehicles, scale changes, and realm transitions?
14. **G6.2 — bounded cooperative aggregation:** How are simultaneous rescuers, pilots, passengers, pursuers,
    bystanders, large creatures, and offscreen participants aggregated or individualized so cooperative scenes stay
    legible without eager simulation of every actor?

No Wave 6 answer is accepted yet. Questions 1-10 form the first easy-numbered discussion batch; P6.11-P6.12 and
G6.1-G6.2 remain visibly queued rather than omitted. Wave 6 remains **OPEN**; no implementation is authorized.

### 15.1 Current-authority and implementation audit — strong laws, missing shared body/capacity owner

The current direction and code already contain valuable pieces:

- `DUNGEON-GRAPH.md` and `DESIGN.md` accept true-scale creatures and provenance-first scale domains. Current
  `place-semantics.js` can grow rooms around residents, widen same-domain corridors, and mark cross-domain doors as
  transition/squeeze boundaries.
- That implementation currently derives domains from a single scalar, grows rooms by a coarse fit rule, and
  explicitly labels squeezing a geometry/DM hand-wave. It does not own posture, occupied volume, reach, equipment,
  action cost, forced movement, participation, or a shared capacity transaction. Wave 6 must preserve the useful
  domain scaffold while replacing hand-wave authority in any supported mechanical slice.
- `GUISE.md` already locks one entity/many forms, engine-owned swaps, form-specific stats and render scale, and
  casting across the whole form set. It leaves effect-specific equipment, space legality, occupancy, reveal/
  knowledge, terminal/reversion, and broader transformation cases to the owning mechanics.
- Closed Wave 10 and Wave 4 already settle the pre-alpha party shape, formation deployment, one advancing scene,
  exact forced-separation cold record, traversal order/partial completion, and staged later same-scene autonomy.
  Wave 6 may fill participation and capacity detail but may not quietly re-enable an independently advancing split
  party as prototype scope.
- Genesis does **not** begin this wave with an unsized art handful. Its existing roughly two-thousand-sprite working
  corpus is already sized, the generated registry carries `worldHeight`/`heightSource` across thousands of entries,
  and the renderer already consumes true-scale figure and guise-scale data. Wave 6 must reuse and audit that corpus;
  it must not pretend that three newly chosen sprites establish scale. The remaining gap is that visual footprints,
  camera fitting, collision approximations, logical room domains, combat occupancy, posture, reach, capacity, and
  form changes do not yet consume one complete canonical body profile.
- No current `CastRoster` owns the minimum non-aggregatable identity/transition facts across individual, cohort,
  party, vehicle, form, scene, and cold representations. Existing cast, group, walk, combat, and projection records
  are useful inputs, not a unified Wave 6 contract.

The choices below decide the shared behavior and authority boundary. Exact schemas, numeric capacity bands, and
solver details remain later specification/evidence work; no code change is authorized.

### 15.2 First discussion batch — P6.1-P6.10

Each item names whether Adam's taste is materially needed. **Prototype** means the smallest no-cash MacBook Pro
proof; **MVP** means a narrow honest playable feature; **ideal** retains the long-term goal without forcing its
breadth into the first implementation.

**Existing-corpus correction (Adam, 2026-07-22):** Genesis already has roughly 2,000 sized sprites. Any small cast
named below is a retained integration and visual-QA slice selected from that corpus, not a request to author, size,
or bootstrap the body system from a few specimens. The prototype must prove that the shared contract can consume
existing registry truth and preserve it through mechanics, scene projection, and the provider-neutral DM seat.

1. **What is the canonical physical description of a body or form? — P6.1**

   **Decision authority:** mostly technical; the commitment to true scale and systemic bodies is already accepted.

   **A — Size category plus one occupied cell:** Small, Medium, Large, and so on determine a token footprint; height,
   posture, reach, long bodies, movement modes, and equipment are handled ad hoc. A prone ogre and standing ogre
   therefore occupy the same abstract cube even under a low ceiling.

   **B — Canonical entity plus active `BodyForm` profile:** one entity points to an active form that declares rules-
   relevant size category, support footprint, standing/crouched/prone volume, height band, reach profile, mass/load
   class, movement modes, limb/object-use capabilities, long-body or swarm shape, and equipment envelope. Effects
   may override named fields; geometry, tactics, renderer, camera, and DM seat derive from the same version.

   **C — Continuous collision skeleton/physics body:** infer fit, reach, pose, and mass from a detailed animated
   volume. Potentially precise, but wrong for sprites, expensive, and lets presentation drift into mechanics.

   **Recommendation: B.** Prototype by wiring and auditing a retained mixed-scale scene plus one existing form swap
   from the already-sized corpus; the small cast is test coverage, not new corpus work. MVP proves representative
   D&D sizes/modes across the existing registry and supported mechanics; ideal supports unusual bodies, swarms,
   vehicles, changing forms, and richer pose envelopes. **Cost:** medium contract/integration and corpus-audit cost,
   high behavioral breadth later; no foundational sprite-sizing pass is implied.

2. **How should capacity and co-location differ by activity? — P6.2**

   **Decision authority:** technical default, with later play/taste review of crowding.

   **A — Area/headcount capacity:** divide floor area by token footprint and use that number for living, fighting,
   working, hiding, riding, and emergency occupancy. Simple, but a guard room that can hold ten standing people may
   not let ten guards fight, sleep, work the desk, or pass the door.

   **B — Typed activity-capacity envelopes:** cells, zones, rooms, assemblies, carriers, and vehicles expose relevant
   standing, transit, work/use, tactical, concealment, seating/riding, load, comfort, and emergency-overflow slots or
   limits. Current occupants, objects, postures, reservations, access faces, and exits consume them. The DM seat can
   say “six can shelter here, two can fight effectively, and the desk becomes unusable above four” without inventing
   another room size.

   **C — Emergent crowd physics:** simulate bodies and infer capacity from their ability to pack/move. High cost and
   poor rules transparency.

   **Recommendation: B.** Prototype standing/transit/tactical/work capacity in one guard room and threshold; MVP
   adds common rooms, mounts, and carriers; ideal handles crowds, vehicles, emergencies, and nonhuman domains.
   **Cost:** medium modeling/tuning, with exact numbers deferred to retained evidence.

3. **How mechanical should squeezing and constrained movement be? — P6.3**

   **Decision authority:** meaningful product/gameplay call because the current implementation explicitly hand-waves
   it.

   **A — Binary fit or DM hand-wave:** a body either passes or the DM narrates a squeeze/check. Cheap, but armor,
   posture, reach, cover, speed, forced movement, and repeated rulings drift by provider.

   **B — Graded constrained-traversal transaction:** geometry and `BodyForm` determine legal normal passage,
   squeeze, crouch, crawl, climb, twist/long-body movement, equipment removal, assistance, or true blockage. The
   applicable D&D squeeze/action/effect rules supply costs and risks; terrain, armor/equipment, reach, cover,
   opportunity, forced movement, time, noise, and partial completion add only causally relevant outcomes. A goblin
   may walk through a crevice, a Medium armored PC may squeeze or remove a pack, and an ogre may need another route
   or a real widening action. The DM narrates the committed mode and stakes.

   **C — Pose-by-pose physical navigation:** continuously solve limb and equipment motion through exact geometry.
   Powerful but financially and technically disproportionate.

   **Recommendation: B.** Prototype normal/squeeze/crawl/blocked across one real transition; MVP covers common
   passages, equipment, help, forced separation, and save/remount; ideal adds long bodies, shapechange, crowds, and
   richer environmental manipulation. **Cost:** medium-high cross-system work.

4. **How should dragon-, giant-, tiny-, and mixed-scale sites be organized? — P6.4**

   **Decision authority:** largely inherited; taste matters when actual mixed-scale captures arrive.

   **A — Human-scale site plus enlarged boss room:** the dragon fits its chamber but cannot plausibly patrol, enter,
   feed, or use the rest of its lair. This is the “room that merely fits the monster is a prison” failure.

   **B — Provenance-first scale domains and transition architecture:** original builders/users establish coherent
   room-and-route domains. Dragon halls, service passages, prey/prisoner spaces, humanoid adaptations, tiny ducts,
   machine corridors, great gates, squeeze thresholds, viewing openings, and bypasses coexist through explicit
   relationships. Current inhabitants adapt or mismatch the inherited shell without retroactively rebuilding it.
   The DM seat knows who can access which domain and why.

   **C — Scale the whole site to its largest resident:** guarantees fit but creates universally oversized rooms,
   erases mixed use, and weakens human-scale exploration.

   **Recommendation: B.** Prototype one human/large-domain boundary or documented mismatch; MVP adds representative
   mixed domains and alternate approaches; ideal spans Tiny-through-Gargantuan, vehicles, colonies, changing forms,
   and evolving occupation. **Cost:** medium over Wave 3 geometry, high corpus breadth later.

5. **How should party split and regroup work? — P6.5**

   **Decision authority:** the near-term product choice is already settled; this confirms the later seam.

   **A — Party can never separate mechanically:** everyone teleports back into one formation or separation becomes
   prose. Safe but invalidates traps, collapses, capture, different vehicles, and rescue.

   **B — One advancing scene now, transactional branches only after proof:** prototype/pre-alpha has no voluntary
   split command. Same-scene members retain `inside`/`at portal`/`adjacent` participation. Forced persistent
   separation commits exact who/where/when/why, condition, custody/inventory, knowledge, communications, return/
   rescue handles, clocks, and a self-inert cold record while the main scene advances. Later, after C4D same-scene
   autonomy proves safe, explicit parent/child SceneLineages may alternate turns and reconcile through versioned
   events rather than simultaneous provider improvisation.

   **C — Full simultaneous split-party campaigns from prototype:** switch freely among independently advancing
   groups with parallel DM turns. Ideal breadth at prohibitive state, UI, narration, fairness, and QA cost.

   **Recommendation: B.** Prototype one forced separation/remount; MVP preserves exact cold consequences and rescue;
   ideal adds deliberate transactional splits only after evidence. **Cost:** medium for retained cold seam, very high
   for the ideal branch scheduler.

6. **What may a CastRoster aggregate without losing people? — P6.6**

   **Decision authority:** mostly technical, constrained by accepted identity and population laws.

   **A — Every possible person is always a fully active individual:** maximally literal but overwhelms generation,
   saves, updates, DM context, and presentation.

   **B — Stable identity floor plus tiered cohort representation:** rooted, touched, named, witnessed, injured,
   equipped, relationship-bearing, knowledgeable, promised, separated, or transition-bearing actors retain exact
   records. Anonymous untouched multiplicity may remain a group/cohort with stable owner, count/capabilities,
   distribution, condition/motive summary, location scope, and deterministic promotion. Distinctive deltas remain
   exceptions and cannot be averaged away. Twenty guards may stay a cohort while the captain, wounded witness, key
   bearer, and pursuer remain individuals; the DM seat receives only the active relevant slice plus honest totals.

   **C — Regenerate incidental individuals whenever a group mounts:** cheap, but creates duplicate guards, erased
   wounds, broken aliases, and impossible witness/custody continuity.

   **Recommendation: B.** Prototype one cohort plus two promoted individuals; MVP proves aggregation/promotion/
   compaction across site/cold transitions; ideal handles dense institutions, crowds, migrations, and richer group
   dynamics. **Cost:** medium-high persistence and identity work.

7. **How should mounts, vehicles, carried creatures, passengers, and cargo retain location? — P6.7**

   **Decision authority:** architecture mostly inherited; supported breadth and player control deserve later taste
   evidence.

   **A — Containment string:** actors become merely `inside wagon` or `on horse`, with no seat, operator, attachment,
   relative position, capacity, or separation state. Cheap until a fall, attack, boarding action, or crash occurs.

   **B — Reference-frame attachment plus independent citizens:** mount/vehicle/carrier remains a canonical actor or
   object with frame, orientation, movement owner, condition, seats/holds/attachment points, load limits, and route
   compatibility. Riders, pilots, passengers, carried actors, and cargo retain their own ids, conditions, custody,
   relative locations, participation/access, and board/dismount/fall/separation receipts. A rider falling does not
   teleport or duplicate the horse; a wagon crash can displace each occupant lawfully.

   **C — Merge the whole conveyance into one temporary compound entity:** easy movement and combat token, but erases
   individual targeting, rescue, inventory, witnesses, and terminal outcomes.

   **Recommendation: B.** Prototype one rider/mount or tiny carrier relation; MVP supports a narrow mount/wagon
   family and interruption; ideal adds ships, flying carriers, nested transport, crowds, and broad vehicle damage.
   **Cost:** medium-high integration, high ideal breadth.

8. **How should guises and transformations preserve one person? — P6.8**

   **Decision authority:** core choice is already accepted in `GUISE.md`; effect-specific handling remains technical.

   **A — One entity per form:** human dragon, true dragon, wild-shaped druid, reverted druid, and mimic chest become
   linked but separate actors. This duplicates history, initiative, conditions, relationships, and custody.

   **B — One entity with versioned active form:** forms supply their own `BodyForm`, stat frame, movement/object-use,
   sprite/standee binding, and permitted equipment behavior. An engine-owned transformation event validates space,
   duration/driver, equipment drop/merge/wear rules, condition/resource transfer, reveal/witness knowledge, legal
   displacement, reversion, and terminal result. The DM narrates the same person's witnessed change; it never casts
   a replacement NPC.

   **C — Cosmetic sprite/scale swap:** preserve identity but leave mechanics unchanged, making a bear, dragon, or
   chest guise physically false.

   **Recommendation: B.** Prototype one form swap with size/stat/render/reveal continuity; MVP supports representative
   innate, spell, and object-guise cases; ideal expands unusual forms, partial transformations, vehicles/swarms, and
   complex equipment. **Cost:** medium for shared event/identity seam, high effect breadth.

9. **How should helpers, rescuers, bystanders, groups, and environmental actors participate? — P6.9**

   **Decision authority:** high-value gameplay/taste call.

   **A — Give every present actor a full initiative turn and detailed action:** mechanically explicit but turns a
   rescue with twenty guards, passengers, pursuers, and bystanders into an unplayable queue.

   **B — Typed participation roles with real contributions:** exact primary actors take full turns where rules
   require them; helpers, anchors, rescuers, pilots, passengers, witnesses, group-pressure sources, bystanders,
   summons, and environmental owners receive bounded capability/action/reaction/resource windows and receipts.
   Aggregate actors contribute only what their cohort and current position can actually supply. In a shaft rescue,
   the hanging PC, rope anchor, active rescuer, two lawful helpers, pursuer pressure, and witness group all matter
   without receiving identical combat turns or becoming an abstract progress bar. The DM seat states who can help,
   how, at what risk/cost, and what changed.

   **C — Only the focus actor is mechanical:** everyone else contributes through narration. Fast but makes teamwork,
   rescue, crowds, and multi-actor consequences cosmetic.

   **Recommendation: B.** Prototype one rescue/cooperative check with four distinct roles; MVP covers common combat,
   traversal, hazard, vehicle, and CrisisChain participation; ideal supports large mixed groups and richer autonomy.
   **Cost:** medium-high action/UX/DM-contract work.

10. **How should players read scale, danger, and access before committing? — P6.10**

    **Decision authority:** meaningful presentation/accessibility taste; exact computation is technical.

    **A — Reveal fit/reach only after an attempt:** diegetic uncertainty, but produces avoidable gotchas and asks
    players to infer mechanics from imperfect sprites.

    **B — Viewpoint-legal diegetic tells plus expandable exact access:** geometry, standee/base, posture, route
    preview, threshold silhouette, scrape/wear/evidence, object scale, and plain DM language communicate obvious
    fit, reach, pursuit, visibility, hearing, and alternate approaches. Inspection or accessibility settings expose
    exact known mechanics when useful. “The armored fighter can squeeze if the pack comes off; the ogre cannot follow
    without widening the gap; the goblin can move normally” is actionable fiction, not a hidden DC or a universal
    glowing outline. Unknown forms/capabilities remain honestly uncertain.

    **C — Permanent universal fit/reach icons and outlines:** clear but visually noisy, metagame-heavy, and prone to
    leaking hidden bodies or routes.

    **Recommendation: B.** Prototype one threshold comparison across two bodies and a text/accessibility equivalent;
    MVP covers supported access/participation modes; ideal adds crowds, vehicles, transformations, richer spatial
    navigator support, and player-owned detail settings. **Cost:** medium projection/UX/QA work.

**Recommended slate:** Option **B** for all ten. P6.1, P6.2, P6.4, P6.6, and P6.8 are mostly inherited or technical
defaults. P6.3, P6.5, and P6.7 need confirmation that their phased behavior matches the intended game. P6.9 and
P6.10 most directly need Adam's gameplay and presentation taste. Nothing in this batch commits ideal breadth to the
prototype or playable MVP.

Wave 6 remains **OPEN**. No answer above is accepted until Adam responds, and P6.11-P6.12/G6.1-G6.2 remain queued.

### 15.3 Supplemental tactics-tutorial research interruption — retained without reopening Genesis authority

Before answering P6.1-P6.10, Adam supplied the retained research input
`Reference/Procedural-Dungeon-Research/claude-tactics-rpg-tutorial-mining-2026-07-22.md` and asked whether its
Unity/Godot tactics-tutorial patterns should affect, aid, or warn future visual-engine implementation. The source
index already records it as R2. A Codex applicability audit is appended to that research file without deleting or
rewriting the supplied text.

The audit retains the compact canonical cell/height spine, pure spatial-query boundary, transit-versus-stop
distinction, declarative range/area/eligible-target decomposition, immutable preview/commit receipts, and pitfall
checklist as later specification evidence. It amends the overbroad claims that one unweighted BFS should own every
query or that every D&D effect should target only cells. It rejects the tutorial height-noise generator as a
Genesis composition solution and protects C1H. It defers exact-cell tactics scoring beneath Genesis's already-built
custom-table/behavior/state-machine proposals, binding morale, trash autoplay, and provider-neutral DM-seat law.

No closed Wave 10 initiative, camera, facing, visual-compiler, or composition ruling is reopened. The existing
five-foot cells, one-foot tier provenance, typed connectors, D&D rules, graphics-as-projection boundary, and Wave 8
mutation ownership remain intact. No code, asset, layout, dependency, license admission, or implementation is
authorized by R2.

R2 strengthens the future inputs/projections implied by P6.1, P6.2, P6.3, P6.8, and P6.10 but changes none of the
P6.1-P6.10 options or Option B recommendations. Candidate implementation evidence is routed prospectively to C1D,
C1E, C1H, and Waves 7-8. The Feature-Promotion Ledger does not change because research alone creates no accepted MVP
obligation; it must be reconciled after Adam's Wave 6 dispositions and later owning specifications.

All material follow-ups generated by this interruption now have an adopt, amend, reject, or defer disposition.
Wave 6 remains **OPEN** at the unanswered P6.1-P6.10 batch. P6.11-P6.12/G6.1-G6.2 remain queued, and explicit Adam
closure is still required.

### 15.4 P6.1-P6.10 rulings — all B, with D&D, prior-ruling, cast, and waiting-party reconciliation

Adam answered the complete first batch on 2026-07-22:

1. **P6.1: B**, after checking the DMG and Monster Manual on creature sizes.
2. **P6.2: B**, congruent with the capacity and reservation work already sketched.
3. **P6.3: B**, using ordinary D&D/SRD rules and DCs for uncertain material cases rather than building a physics
   simulator.
4. **P6.4: B**, recovered as the already-discussed provenance-first scale-domain ruling rather than re-decided.
5. **P6.5: B**, with no ordinarily separating party and no independent companion action in the early game. If only
   the PC can clear a crossing, companions may remain waiting at their last legal anchor while the PC continues.
6. **P6.6: B**, with the explicit cast boundary that a character joins the cast after player interaction; until
   then, `Guard 5` is only `Guard 5` and does not deserve a fleshed-out person record.
7. **P6.7: B.**
8. **P6.8: B.**
9. **P6.9: B.**
10. **P6.10: B.**

The Option B architecture is therefore **ACCEPTED for P6.1-P6.10 on the phased bases below**. The qualifications are
part of the rulings, not invitations to replace them during implementation.

#### D&D size-source check and the `BodyForm` boundary

The locally available core books are the **2014** editions, not the 2024 books described by the repository's newer
page-index metadata. They were checked without silently mixing editions: the 2014 *Dungeon Master's Guide* p. 274
(`Step 2. Size`) and *Monster Manual* pp. 6-7 define the familiar Tiny/Small/Medium/Large/Huge/Gargantuan categories,
combat spaces, and monster Hit Die relationship. Genesis's retained clean **SRD 5.2.1** supplies the current rules
baseline. Its `Creature Size` rule likewise says that size determines the square space a creature effectively
controls and needs to fight effectively: Tiny is 2.5 by 2.5 feet/four per five-foot square; Small and Medium are
5 by 5; Large is 10 by 10; Huge is 15 by 15; and Gargantuan is 20 by 20 or larger. The current SRD separately owns
movement modes, reach, occupied-space interaction, and size-scaled carrying capacity.

The resulting P6.1 law is deliberately stronger than copying a size table and deliberately weaker than anatomical
physics:

- D&D size supplies a **combat-control footprint**, not literal anatomy, standing height, sprite bounds, mass, or a
  continuous collision hull.
- `BodyForm` is the shared canonical rules-facing profile that relates that D&D space to posture/volume envelope,
  support footprint, reach, movement modes, object-use capabilities, load class, unusual body topology, active form,
  and the existing registry's visual-height provenance.
- A creature's stat-block reach and movement remain authoritative where supplied. Neither render height nor size
  category invents a longer reach, a climb speed, or a capacity exception.
- The 2014 monster-design Hit Die-by-size table remains source/edition-specific authoring guidance; it is not a
  universal Genesis `BodyForm` mechanic and does not override an imported stat block or current rules source.
- The existing roughly two-thousand-sprite corpus, registry height provenance, guise-scale data, and true-scale
  renderer paths remain useful working capability. The retained prototype cast only tests integration and visual
  QA across the shared contract; no sprite bootstrap, bulk rescaling, or replacement corpus is authorized.

**Phasing:** the no-cash Mac proof uses a retained mixed-scale scene and one already-supported form swap to prove
one canonical version reaches mechanics, renderer/camera, accessibility text, save/remount, and the provider-neutral
DM seat. The playable MVP covers representative rules sizes and movement/form cases actually used by its supported
content. Unusual long bodies, swarms, broad vehicle bodies, partial transformations, and exhaustive corpus
normalization remain evidence-triggered ideal breadth. **Cost:** medium contract/integration/corpus-audit work;
high only as unusual-body and effect breadth grows.

#### P6.2 congruence — capacity composes existing owners

Typed activity capacity does not create a second room size or a universal headcount. It composes already accepted
truth:

- Wave 2's purpose/population/service obligations and ordered preservation -> credible strained/failing state ->
  explicit refusal;
- Wave 3's builder/original-use scale domains and typed spatial reservations;
- Wave 4's exact aperture, traversal-order, load/capacity, partial-completion, and separation receipts; and
- Wave 5's committed footprints, supports, access faces, clearances, portals, circulation, focal reservations,
  furniture layers, and honest sparse/crowded/stripped/empty states.

Thus a guard room may legally expose different standing, transit, work, tactical, comfort, shelter, concealment,
and emergency-overflow results without changing its walls. A desk's access face can be unavailable while six people
can still shelter; two people may pass a threshold in sequence even though only one can fight effectively in its
apron. Each result names the activity, consumers, reservations, conditions, and consequence or unsatisfied reason.
The provider-neutral DM seat receives those facts; it cannot turn `overcrowded` into `comfortably operating`.

**Phasing:** the proof reuses one retained guard room and threshold; the MVP grows only the common room, assembly,
carrier, and traversal activities used by playable content; crowds, emergencies, vehicles, and broad nonhuman
institutions remain ideal expansion. **Cost:** medium modeling, tuning, diagnostic, and representative-fixture work.

#### P6.3 SRD-first constrained movement — rules, then an ordinary DC, never body physics

The accepted resolution order is:

```text
1. Apply an explicit D&D/SRD action, movement, condition, size, effect, or stat-block rule when it settles the case.
2. If the attempted method remains genuinely uncertain and failure matters, use an ordinary ability/skill/tool
   check and a stated DC/consequence from the retained rules framework.
3. If the body/equipment and geometry make the attempted method impossible, report the blockage and legal changes
   of state or alternate approaches; do not roll until success appears.
```

In the current SRD, a narrow opening sized for a creature one size smaller is Difficult Terrain; crawling costs
extra movement; occupied-space and moving-around-creatures rules remain explicit; slippery climbing or rough
swimming may use the supplied DC 15 examples. Genesis therefore does not invent a universal squeeze check on top
of routine legal movement. Most **material custom constraints not already settled by a rule** may use a normal DC
instead of geometric simulation—the ordinary ladder is 5/10/15/20/25/30 for very easy through nearly impossible—
with the relevant ability/proficiency, stakes, cost, noise, time, position, and partial completion named before
commit. Removing a pack, changing posture, using a tool, accepting help, or changing the route changes the attempt's
state; it does not negotiate with renderer physics.

For example, a Medium PC moving through a one-size-smaller opening pays the current rule's Difficult Terrain cost
without a gratuitous roll. Forcing an armored pack through shifting stone may require a stated Strength (Athletics)
or tool check because that additional task is uncertain. An ogre that cannot physically enter receives a blocked
result plus lawful alternatives such as another route, a form change, or a certified widening action. The DM seat
narrates only the committed rule/check outcome.

**Phasing:** proof normal/difficult/crawl/check/blocked outcomes at one threshold; MVP adds the common equipment,
help, interruption, forced-movement, save/remount, and accessibility cases its content uses; long-body articulation,
crowds, and rich manipulation remain ideal. **Cost:** medium-high mechanics/query/UI/QA integration, explicitly
bounded below continuous pose physics.

#### P6.4 congruence — provenance-first scale domains remain the authority

P6.4 does not reopen Wave 3. The later accepted P3.4 ruling governs any older sketch that says a dungeon scales
around a resident: **builder/original-use scale is canonical; a current occupant must use a compatible inherited
domain, an explicitly caused adaptation, or an honest mismatch.** An apex creature scales the whole site only when
original construction/use or a committed later transformation supports that fact. Arrival alone never retroactively
widens corridors or raises ceilings.

The no-cash proof retains one human/large-domain threshold or one documented mismatch; MVP accumulates representative
mixed-domain routes and alternate approaches; Tiny-through-Gargantuan institutions, changing occupation, colonies,
and broad vehicle/machine domains remain ideal corpus breadth. **Cost:** medium reuse/diagnostic work now, high only
with representative-domain breadth.

#### P6.5 generated follow-up — one advancing PC scene plus an exact waiting party

Adam's PC-only-crossing exception is accepted through a **waiting-party state**, not through an early split-party
simulation:

1. There is no general voluntary split-party command, child SceneLineage, off-focus DM turn, view switching, or
   companion action scheduler in prototype/pre-alpha.
2. A traversal transaction may lawfully produce different per-traveler outcomes. When the PC alone clears a
   crossing and chooses to continue, each companion remains at the last legal `at portal`/`adjacent` anchor with
   exact identity, condition, custody/inventory, knowledge, communication, separation cause/time, and reunion route.
3. The main-PC SceneLineage is the only advancing scene. The waiting party moves nowhere, takes no action or roll,
   spends nothing, discovers nothing, and cannot be advanced by provider prose. It is not an invisible second game.
4. A mechanically owned site/world event may still affect the waiting record through a canonical receipt, as the
   already-accepted cold-record law requires. It grants the party no self-directed response; any supported urgent
   consequence must interrupt/reframe or wait for a later owning system rather than being improvised offscreen.
5. Reunion/remount uses the retained anchor and transaction facts. The implementation must never teleport the party
   through the crossing merely to simplify formation.

This is the lowest-cost honest early solution because it extends the accepted `inside`/`at portal`/`adjacent` and
self-inert cold seams without building branch reconciliation. It does **not** delete C4D's later toggleable bounded
same-scene companion autonomy, which still precedes any independently advancing split-party feature.

**Phasing:** prototype one PC-only crossing, exact wait, save/load, and reunion; playable MVP shares this with forced
separation/rescue and externally owned consequences; same-scene autonomous companions and transactional split
lineages remain ordered feature goals. **Cost:** medium transaction/anchor/recovery/UX work now; very high branch
scheduling remains deferred.

#### P6.6 generated follow-up — CastRoster means player-contact cast, not every world actor

The phrase `CastRoster` is narrowed so it does not contradict Wave 2's role/candidate/canonical-NPC lifecycle:

- An unseen or merely generated role may remain a role slot, candidate card, cohort, or deterministic ordinal.
  Passive population, camera presence, or the label `Guard 5` does not earn a personal sheet or CastRoster slot.
- **Direct material interaction promotes the same actor into the player-contact CastRoster.** Conversation, a
  targeted or reciprocal attack, exchange, rescue, custody, a personal check/action, or another direct causal
  encounter counts even if the name is unknown. Promotion never rerolls appearance, equipment, wound, knowledge,
  location, or provenance already attached to that identity.
- Earlier canon may still require a minimal stable actor outside the CastRoster. A named prisoner in a document, an
  unseen attacker, a guard who alone witnessed the theft, or a unique key bearer cannot be recycled if their exact
  identity/delta owns continuity. Before player interaction they remain a compact canonical actor or cohort
  exception with only the necessary facts—not a fleshed-out companion-style cast entry.
- If no individual choice, evidence, relationship, equipment, custody, knowledge, or other continuity-bearing delta
  matters, `Guard 5` stays an ordinal inside the guard cohort. Genesis does not spend generation, save, simulation,
  renderer, or DM-context budget pretending the player should care.

This preserves the earlier distinction among candidate, rooted world identity, player knowledge, and active cast
while applying Adam's stronger attention threshold to the CastRoster itself.

**Phasing:** proof one anonymous cohort with one direct-contact promotion and one pre-contact continuity exception;
MVP proves stable promotion/compaction/save/remount without duplicates or lost deltas; rich institutions, crowds,
migrations, and social graphs remain ideal. **Cost:** medium-high identity/storage/query/DM-context work, but lower
runtime and narrative noise than treating every possible person as active cast.

#### P6.7-P6.10 accepted boundaries

- **P6.7 mounts/vehicles/carrying:** every supported carrier/conveyance uses typed reference-frame, attachment,
  seat/hold, capacity, custody, location, board/dismount/fall/separation, and terminal receipts while every occupant
  remains an independent citizen. No transport family is promised merely by accepting the contract. Proof may use
  one narrow existing carrier/mount relation; C4F remains the evidence-triggered horse/wagon promotion, and ships,
  flight, crowds, nested transport, and broad vehicle damage remain ideal breadth. **Cost:** medium-high per
  supported family, high at ideal breadth.
- **P6.8 forms/guises:** one entity owns versioned forms; an engine-owned transformation validates BodyForm/stat/
  movement/equipment/space/reveal/condition/terminal changes and rebinds the existing visual citizen. Effect text,
  not a universal invented transfer rule, decides what persists or reverts. Proof uses one existing form swap; MVP
  adds only representative supported effect families; unusual/partial forms remain ideal. **Cost:** medium common
  seam, high effect breadth.
- **P6.9 participation:** exact primary actors receive full turns only where the rules require them. Helpers,
  anchors, rescuers, pilots, passengers, witnesses, cohorts, bystanders, summons, and environmental owners contribute
  through typed capability/action/reaction/resource windows and receipts; no role supplies free invisible action
  economy. Proof uses one bounded rescue/cooperative trace; MVP covers common supported combat/traversal/hazard cases;
  large mixed groups and richer autonomy remain ideal. **Cost:** medium-high mechanics/UX/DM-contract work.
- **P6.10 access/danger presentation:** geometry, true-scale citizens, posture, route previews, threshold evidence,
  object scale, and plain provider-neutral language give viewpoint-legal tells; inspection/accessibility may expose
  exact known fit, reach, pursuit, hearing, visibility, and alternatives. Unknown capability remains uncertain, and
  no universal outline may leak it. Proof uses one two-body threshold comparison plus text equivalent; MVP covers
  supported modes; richer crowds/vehicles/forms/spatial-navigation settings remain ideal. **Cost:** medium
  projection/accessibility/QA work.

#### Partial phasing and promotion reconciliation

No new giant Wave 6 implementation pass is created. The accepted first batch maps onto retained vertical proofs:

| Accepted family | Earliest retained proof seam | Playable gate / later promotion |
|---|---|---|
| P6.1/P6.4/P6.8 body, domain, and form truth | C1A/C1D shared citizen and battle projection; one retained form swap | C2D continuity plus supported mixed-scale/form cases; unusual bodies and broad transformation effects later |
| P6.2/P6.3/P6.10 capacity, constrained traversal, and tells | C1B threshold preview/commit plus C1J guard-room reservations | C2N representative risky/group crossing and accessible equivalents; broad crowds/vehicles later |
| P6.5 waiting/forced separation | C2G exact cold record; C2N ordered crossing | C2G playable wait/consequence/reunion; C4D same-scene autonomy before later split lineages |
| P6.6 CastRoster/cohort boundary | C4A candidate/cohort/direct-contact promotion | C4A/C4C continuity under group/site events; richer social graph later |
| P6.7 carrier/reference-frame truth | Existing dynamic-citizen relation seam; C2N where a supported crossing needs carrying | C4F only after a horse/wagon distinction earns promotion; broader vehicles later |
| P6.9 typed participation | C1D exact combat actor boundary; C2N one rescue/cooperative trace | Supported battle/traversal/hazard participation; richer group autonomy later |

The Feature-Promotion Ledger is reconciled to these partial dispositions. This does not claim implementation, does
not mark a proof `PROVED` or `MVP`, and does not pre-empt the remaining Wave 6 questions. P6.11-P6.12/G6.1-G6.2
remain queued; their answers may refine evidence cases and schemas but may not silently revoke the accepted
P6.1-P6.10 destinations.

All generated material follow-ups from this first batch now have a disposition. Wave 6 remains **OPEN** and still
requires the remaining four-question batch, a final contradiction/phasing/coverage audit, ledger and Clay Proof
Ladder reconciliation at closure scale, and Adam's explicit agreement before closure. No implementation is
authorized.

### 15.5 Remaining easy-numbered batch — P6.11-P6.12/G6.1-G6.2

This final original/additive batch inherits section 15.4. It may not shrink canonical scale for camera convenience,
turn a retained QA slice into a replacement art corpus, re-enable independently acting waiting companions, promote
every `Guard 5` into CastRoster, duplicate canonical facts into a renderer/provider record, or create a second
acceptance corpus beside the retained twelve golden sites/eight adversarial traces and P10.12 evidence process.

1. **How should true-scale bodies remain visually legible without changing mechanics? — P6.11**

   **A — Camera-driven scale compression and icon substitution:** shrink a dragon until it fits the frame, spread
   overlapping creatures into presentation-only positions, and replace a crowd or waiting party with convenient
   tokens even when mechanics says otherwise. In a dragon hall the board might show a Large-looking dragon over a
   two-square base while the provider-neutral DM seat says it controls a much larger space. Cheap and tidy, but the
   image, picking, route preview, reach, and narration cease to describe the same encounter.

   **B — Canonical true-scale projection with governed readability tools:** `BodyForm`, occupied cells/volumes,
   elevation, attachments, active form, and the existing sprite registry's height provenance remain canonical
   inputs. The interim and future renderers preserve the same footprint and spatial relations while using the
   already-accepted fixed production camera family, bounded pan/zoom/focus, legal composition, cutaway/ghosting,
   selection/base/height cues, cohort-aware visual aggregation, and text/spatial-navigator equivalents. A Huge
   dragon may extend beyond its controlled base without shrinking that base; a pixie remains tiny but pickable; a
   transformed druid rebinds the same citizen; waiting companions remain anchored off the PC's legal side rather
   than becoming an invented split-screen scene. The DM seat receives viewpoint-legal size, reach, access,
   occlusion, and uncertainty facts and never reasons backward from sprite pixels.

   **C — Bespoke free camera and animation solution per body type:** use free orbit, special rigs, continuous
   collision/animation, and hand-tuned shots for dragons, swarms, mounts, crowds, and every guise. A wyvern boarding
   scene could look spectacular, and the DM could narrate from the chosen shot, but camera behavior becomes a second
   game, the fixed-camera identity disappears, provider/accessibility parity gets expensive, and the no-cash Mac
   prototype inherits a large 3D-production burden.

   **Recommendation: B.** The no-cash Mac proof uses a small retained selection from the existing corpus—at least
   one Tiny/Small citizen, one Medium citizen, one Large-or-larger citizen, one threshold/elevation relation, and
   one existing form swap—through the actual fixed-camera path, low/high outcome tier, text equivalent, and
   save/remount. That is integration/visual QA, not art creation or corpus resizing. The playable MVP expands only
   across sizes, crowds, forms, occlusion, and carriers that supported content actually uses. Broad swarms, ships,
   flight, nested vehicles, extreme crowds, and richer visual choreography remain ideal feature goals. **Cost:**
   medium-high projection/camera/picking/accessibility/capture QA, far below bespoke rigs or continuous physics and
   protective of Genesis's working true-scale paths.

2. **What evidence should prove Wave 6 without demanding every combination at once? — P6.12**

   **A — A few attractive mixed-scale screenshots:** capture a dragon beside a fighter, a crowded guard room, and a
   transformed druid. The provider-neutral DM seat can describe what the shots intend. Cheap, but still frames do
   not prove legal movement, DC ownership, capacity, identity promotion, waiting-party inertia, carrier separation,
   terminal outcomes, provider parity, save/remount, or performance.

   **B — An incremental risk overlay on the retained corpus:** add Wave 6 dimensions and deterministic traces to the
   existing twelve named golden sites, eight adversarial transition traces, Clay fixtures, and P10.12 matched-capture
   process instead of creating another showcase suite. Admit a fixture only when it covers a missing risk. Across
   the accumulated portfolio, prove: the D&D size ladder and existing registry provenance; one provenance-first
   large-creature domain plus one honest mismatch; guard-room activity capacity; routine narrow-opening movement,
   one ordinary uncertain DC, and true blockage with alternatives; PC-only crossing/wait/reunion; cohort ordinal ->
   player-contact CastRoster promotion plus one pre-contact continuity exception; one supported carrier/reference-
   frame interruption; one form swap/reversion; and one cooperative rescue with bounded roles. Every admitted case
   freezes canonical inputs and expected receipts, then checks mechanics, provider-neutral/fallback facts,
   viewpoint knowledge, accessible equivalents, save/remount/terminal recovery, matched gameplay-scale captures,
   and measured Mac outcome rather than beauty alone.

   **C — Exhaustive Cartesian corpus:** test every size × posture × room × threshold × party arrangement × crowd ×
   vehicle × guise × renderer × provider × terminal state. This sounds complete, but it explodes before playable
   breadth exists, duplicates the retained portfolio, and spends authoring/QA budget on unsupported combinations.
   The DM-seat matrix alone becomes too large to review meaningfully.

   **Recommendation: B.** The no-cash proof adds only the smallest retained cases needed for the first BodyForm,
   guard-room/threshold, form-swap, waiting-party, cast-promotion, and rescue seams; one fixture may cover several
   dimensions only when it remains diagnosable. The playable MVP accumulates cases as content families are actually
   promoted and requires deterministic, batch/property where useful, human/play readability, provider/fallback,
   accessibility, persistence, and performance evidence. The ideal goal is complete Wave 6 coverage distributed
   across the established twelve-site/eight-trace portfolio plus funded human evidence—not a separate Wave 6 theme
   park. **Cost:** medium-high fixture/trace/capture authorship over time, low live-runtime cost, and dramatically
   lower waste than exhaustive combinations.

3. **What should a persistent CastRoster entry own after player contact? — G6.1**

   **A — A name plus the last active-scene snapshot:** after the PC speaks to `Guard 5`, store a name, portrait,
   current room, HP, and a prose summary. When the guard rides in a wagon, changes form, becomes separated, or moves
   realms, overwrite that snapshot. The DM seat gets a compact card, but stale copies lose aliases, custody,
   knowledge provenance, exact transition order, and the distinction between player-known and private motive.

   **B — Stable identity spine plus typed owner references and transition cursor:** direct material interaction
   commits a player-contact CastRoster entry linked to the already-existing entity/latent token. The roster owns the
   stable entity reference, contact/promotion receipt, player-known aliases/referent, player-facing cast status, and
   links to the canonical owners of membership, typed location/precision, active BodyForm/version, condition,
   equipment/custody, knowledge/belief, relationships/obligations, representation tier, and last valid transition/
   consequence cursor. It does not copy those systems into a rival person object. Material facts remain exact or
   compact under their owner; private motive and unknown identity remain viewpoint-safe. A guard first encountered
   by exchanging attacks may enter as `unknown north-gate sentry`, later gain a name without changing identity, ride
   in a wagon through a reference-frame relation, become a waiting/cold record, and remount from the same receipts.
   The DM seat receives only the relevant viewpoint-legal projection plus stable callbacks.

   **C — One monolithic forever-live character record:** copy every stat, inventory item, relationship, memory,
   schedule, exact cell, vehicle, form, prose history, visual binding, and DM context into CastRoster and update it
   continuously. This makes the roster appear self-contained, but duplicates authority, eagerly simulates absent
   actors, bloats saves/context, and creates conflicting copies after a form, custody, or scene transition.

   **Recommendation: B.** The no-cash proof promotes one cohort ordinal through direct interaction, changes one
   owned fact, compacts/remounts the actor, and verifies the same id/knowledge/custody/form/transition references in
   mechanics, renderer, save, fallback, and provider-neutral DM projection; it also retains one necessary pre-
   contact exception outside CastRoster. The playable MVP covers supported scene, group, party, waiting/cold,
   carrier, combat, and form transitions without requiring continuous offscreen simulation. Rich social graphs,
   cross-realm lives, broad schedules, memories, and autonomous behavior remain ideal features under their owning
   waves. **Cost:** medium schema/migration/query/context-budget work and substantial savings over duplicated live
   actor snapshots.

4. **How should cooperative groups stay mechanical without simulating every person? — G6.2**

   **A — Individualize everyone and give every participant a turn:** in a shaft rescue, every rescuer, guard,
   passenger, pursuer, bystander, mount, and waiting companion receives an exact cell, initiative slot, AI choice,
   and DM paragraph. Nothing is abstracted, but a twenty-person emergency becomes an enormous queue and `Guard 5`
   is promoted before the player ever interacts with them.

   **B — Typed participation ledger over cohorts, exact actors, and promotion triggers:** the scene names primary
   actors and bounded roles such as active rescuer, helper, anchor, pilot, passenger, pursuer pressure, witness,
   bystander, environmental owner, and self-inert waiting party. Each role consumes an actual capability, action/
   reaction/resource window, location/access condition, and contribution receipt. Cohorts retain owner, count,
   distribution, condition/capability envelope, motive, and only material exceptions; direct interaction promotes
   the same ordinal/exception into CastRoster. In a shaft rescue, the hanging PC rolls, one companion anchors the
   rope, at most the rules-legal helpers contribute, six guards supply only the pressure their location/capability
   permits, passengers remain a bounded evacuation cohort, and the waiting party does nothing. The DM seat can say
   exactly who is helping, what the crowd changes, whose action/resource was consumed, and which named person became
   material without inventing twenty turns.

   **C — Collapse everyone but the focus actor into one prose modifier or progress bar:** the rescue becomes `crowd
   support +2`; the DM narrates hands on the rope and frightened passengers. Fast, but location, capability,
   witnesses, injuries, promotion, custody, obstruction, and failure consequences become decorative or impossible
   to attribute.

   **Recommendation: B.** The no-cash proof uses one rescue/cooperative trace with a primary actor, one active
   rescuer, one legal helper/anchor, one cohort pressure or witness role, one direct-contact promotion, and one
   explicitly ineligible/self-inert participant. The playable MVP adds only the supported combat, traversal,
   hazard, CrisisChain, carrier, and crowd roles and proves save/remount/provider/accessibility parity. Dense
   institutions, migrations, mass battles, many vehicles, broad offscreen consequence systems, and enabled C4D
   companion autonomy remain ideal feature goals. **Cost:** medium-high action-economy, role-query, UI, receipt,
   persistence, and QA work; bounded well below eager per-person simulation.

**Recommended slate:** Option **B** for all four. P6.11 preserves the accepted fixed-camera/true-scale renderer
boundary rather than selecting a replacement renderer. P6.12 extends the retained evidence portfolio rather than
creating a new corpus. G6.1 distinguishes the player-contact CastRoster from canonical owner stores, and G6.2
projects the already-accepted participation law into a bounded cooperative representation.

Wave 6 remains **OPEN**. No answer in this section is accepted until Adam responds. After the four dispositions,
every generated material follow-up must be resolved and the final original/additive/generated, authority,
contradiction, phasing, Clay Proof Ladder, and Feature-Promotion Ledger audit must precede any request for explicit
Wave 6 closure. No implementation is authorized.

### 15.6 Final batch accepted — preserve real scale, extend retained evidence, keep sparse three-tier nouns, and bound participation

Adam accepts Option B across P6.11-P6.12/G6.1-G6.2, with two binding reminders and one technical delegation:

> 1. B - this is also a rule we have already made, we are going to do our best to preserve actual scale because it is almost never represented in D&D
>
> 2. B
>
> 3. B we have previously discussed using stubs for items, concepts, npcs that only get light contact, rarely grow more of the object than is needed, in the tabletop game i used a 3 tier system, we can get more granular than that if we need to, but we should keep it fairly simple, how costly is it to keep these states? shouldn't be too much to keep text states of objects? am i wrong? i guess you need to decide on a compression method
>
> 4. B

The accepted dispositions are:

1. **P6.11:** preserve actual mechanical scale through the already-accepted fixed-camera projection family and
   governed readability tools. This is a recovered Genesis product law, not permission to choose a new renderer or
   shrink bodies for framing. The existing sprite corpus/height provenance/true-scale paths remain the input.
2. **P6.12:** add Wave 6 risks to the retained twelve-site/eight-trace/Clay/P10.12 evidence portfolio. Do not build a
   separate showcase corpus or require the exhaustive Cartesian product before learning from a narrow proof.
3. **G6.1:** a player-contact CastRoster entry is a sparse stable identity spine plus references to canonical
   owners, not a duplicated forever-live person object. Items, concepts, NPCs, and other contacted nouns grow only
   as play needs more of them. The simple three-tier semantic-growth and compression decision below is accepted as
   the technical implementation direction.
4. **G6.2:** cooperative scenes use typed receipt-bearing participation over cohorts, exact actors, and promotion
   triggers. Waiting companions remain self-inert; no aggregate supplies invisible action economy.

#### G6.1 generated follow-up — cost and a simple three-tier semantic-growth model

Adam's intuition is correct: **the raw persistent bytes for compact text/typed state are usually cheap**. The costly
failures are copying the same noun into several owners, keeping exact transforms/simulation/indexes live when they
are not needed, serializing a whole world synchronously on every save, sending distant records to the DM model every
turn, retaining unlimited narration as mechanical state, and migrating duplicated or prose-shaped schemas.

Genesis already has the right pieces:

- `NPC-PRESENCE-AND-HOOKS.md` uses lazy ambient NPC stubs, interaction-driven flesh, and the tabletop-derived
  `touched & kept` / `touched & dropped` / `never touched` attention model;
- Wave 2 accepts one canonical owner projected through active/site/cold forms, exact retention of material nouns,
  and compaction of safe anonymous multiplicity;
- Wave 5 accepts lightweight assertions that gain only the state required by touch and consequence;
- the architecture sketch accepts deterministic latent commitment capsules rather than eager detail; and
- `DIGEST-DIET.md` already demonstrates the main economic distinction: a full Codex record was about 1.4 KB while
  a roster line was about 40 bytes, and repeatedly re-shipping a 42.9 KB unchanged Codex block cost far more than
  storing it once.

Wave 6 therefore retains **three semantic detail tiers**, with unmaterialized possibility outside the ladder:

| Semantic tier | What it means | Minimum retained shape | What does not happen yet |
|---|---|---|---|
| **1 — Stub** | The player made light direct contact or a material referent must persist, but the noun has not earned deeper modeling | stable id/kind/referent; canonical owner/scope or typed location; provenance/contact/knowledge hardness; current material delta; links to any exact custody, obligation, evidence, or transition owner | no full biography, exhaustive item properties, concept essay, exact offscreen path, continuous AI, or copied history |
| **2 — Working** | The noun now participates mechanically or recurrently | only the capabilities, state/condition, relationships, equipment/custody, knowledge, form, affordances, clocks, and callbacks actually required by supported play, stored sparsely under their proper owners | no speculative fields merely because this type could someday need them |
| **3 — Developed** | Repeated play or high consequence has earned a rich persistent noun | the relevant typed history/turning points, motives/relationships, learned description, variants/forms, recurring obligations, and deeper projection handles that have actually become canon | not a monolithic live simulation, duplicated renderer/DM record, or unlimited transcript |

Uncontacted `Guard 5`, an unresolved ordinary object reserve, or an unselected concept candidate remains a cohort
ordinal, latent commitment, bounded envelope, or provisional card **outside this retained-detail ladder**. Direct
material contact may create a Tier-1 CastRoster stub. Engagement, mechanical use, recurrence, custody, evidence,
relationship, promise, or another real dependency promotes only the needed components. Semantic growth is
monotonic: compaction may reduce the **active projection**, but it cannot unlearn a material fact or reroll the noun.

This three-tier detail ladder stays separate from the existing **activation/projection axis**:

```text
semantic detail:       Stub -> Working -> Developed
activation/projection: active <-> site/aggregate <-> cold
spatial precision:     exact <-> anchored <-> zone/route <-> unresolved
```

A deeply developed recurring NPC can therefore be cold and appear in the DM digest as one roster line. A Tier-1
stool can be active and exact because the PC is currently wedging it under a door. These are not nine new gameplay
tiers; they are three simple semantic depths plus two already-accepted orthogonal owner/projection attributes.

#### Structural compression method — normalize first; compress bytes second

The accepted compression method is **deterministic structural compaction**, not lossy AI summarization:

1. **One canonical sparse record per noun.** Store only present fields and typed owner/component references. Ledgers,
   renderer bindings, cards, and DM prose reference the id rather than copying the payload.
2. **Current truth plus causal receipts.** Keep a small materialized current-state projection and append typed,
   idempotent events/receipts once. On cold compaction, routine repeated receipts may coalesce into deterministic
   typed summaries while identity, turning points, unresolved obligations, custody, knowledge, causes, and terminal
   facts remain recoverable.
3. **Content-address immutable shared material.** Table results, recipes, commitment capsules, source fragments,
   large immutable descriptions, and visual payload references deduplicate by stable id/hash. A record links to
   them rather than embedding another copy.
4. **Separate narration from mechanics.** Full transcripts or expressive prose may live in separately chunked,
   optionally compressed archives. The canonical record keeps only fact-locked state and turning-point references;
   a generated recap never becomes the recovery authority.
5. **Chunked indexed persistence.** The intended production direction is incremental owner/site/world chunks in
   IndexedDB or its later proven successor, with small bootstrap indexes and atomic migrations—not repeated
   synchronous whole-universe `localStorage` serialization. Wave 12 chooses the exact schema, byte encoding, and
   browser-native compression codec from retained measurements.
6. **Retrieve for context; do not bulk-send.** The DM seat receives the active causal frontier, changed deltas, and
   one-line roster/index entries, then pulls a record by id if needed. Embeddings, search indexes, render geometry,
   thumbnails, and provider prompts are rebuildable/evictable projections rather than permanent copies of canon.

An exact gzip/Brotli/CBOR/other storage codec is deliberately **not** locked without measurements. General byte
compression can reduce repetitive JSON/text several-fold, but it does not solve duplicated authority or oversized
provider context. Structural normalization, deduplication, chunking, and scoped retrieval supply the correctness and
largest economic wins; a codec is a replaceable Wave 12 storage decision.

#### Planning-size answer — cheap per noun, measurable at long-world scale

The following are design envelopes for soak tests, not frozen schemas or release limits:

- a normalized Tier-1 stub should plausibly land in the **few-hundred-byte** range; verbose JSON may make it closer
  to roughly 0.3-1 KB before general compression;
- a Tier-2 working noun may commonly be around **1-4 KB** of sparse canonical state, depending on links;
- a Tier-3 developed noun may be **several to tens of KB** before separately archived history, especially if prose
  is embedded—which is why prose should not be embedded repeatedly;
- 10,000 half-kilobyte stubs already approach the old roughly 5 MB `localStorage` wall, while 100,000 are only about
  50 MB before dedup/general compression: reasonable territory for measured IndexedDB persistence, but not for
  whole-world per-turn serialization or provider context; and
- even a tiny roster grows too large to send in full forever. At the measured `DIGEST-DIET` shapes, 100,000
  forty-byte lines would still be roughly 4 MB, so distant nouns need indexed pull and relevance selection rather
  than a universal roster dump.

Thus the **storage bytes are not the scary part**. The implementation cost is medium because schemas, promotion,
single ownership, indexes, migrations, incremental writes, compaction receipts, query boundaries, and soak/recovery
tests must be correct. Runtime and monetary cost stay low when active work and DM context scale with the causal
frontier rather than the lifetime noun count. Exact caps follow measurements of save bytes, changed bytes/turn,
serialization latency, index/query latency, active/context bytes, migration time, and long-session promotion rates.

#### Phasing of the three-tier system

- **No-cash Mac proof:** one object, one concept/promise, and one cohort NPC each begin as a small stub; one promotes
  to Working; one developed or already-rich noun compacts to a roster line and remounts without loss. Measure saved
  bytes, changed bytes, DM digest bytes, and recovery rather than guessing a global cap.
- **Playable MVP:** every supported noun family uses the same three semantic depths, sparse canonical owners,
  active/site/cold projection, incremental persistence, scoped retrieval, and deterministic migration/recovery.
  Unsupported fields simply do not exist yet.
- **Ideal feature goal:** years-long worlds with rich recurring nouns, deep history, search, optional transcript
  archives, cross-device/export policy, and mature automated compaction remain promotions over the same owner/
  component/receipt model. They do not require eager biographies or full-world simulation.

All four final answers are accepted on these phased bases. The compression follow-up generates no further present
taste question: exact byte envelopes and codecs are measurement/specification decisions, while the three-tier
semantic behavior, structural-compaction order, and non-duplication law are now decided.

### 15.7 Full Wave 6 coverage, authority, contradiction, and phasing audit — ready for explicit closure decision

#### Generated material follow-ups

Every material branch generated during Wave 6 now has a disposition:

- **R2 tactics-tutorial interruption:** retain the canonical cell/query/preview lessons; amend universal BFS and
  cell-only targeting; reject height-noise composition; defer tactics scoring and Wave 8 mutation breadth under
  existing Genesis owners.
- **P6.1 source correction:** local 2014 DMG/MM plus current clean SRD confirm D&D controlled combat space; BodyForm
  owns the additional posture/volume/reach/movement/load/form/visual-provenance contract without sprite bootstrap.
- **P6.2 congruence:** typed activity capacity composes Waves 2-5's population, geometry, reservation, assembly,
  access-face, and traversal owners rather than creating a second room size.
- **P6.3 DC boundary:** explicit SRD rules resolve first, ordinary stated DCs resolve consequential uncertainty, and
  true blockage exposes lawful state changes/alternatives; renderer physics never adjudicates success.
- **P6.4 congruence:** later accepted builder/original-use provenance governs older resident-scale sketch language;
  current occupants require compatible domains, caused adaptation, or honest mismatch.
- **P6.5 PC-only crossing:** one advancing PC lineage plus exact self-inert waiting-party anchors preserves the early
  no-split law while retaining C4D autonomy and transactional split lineages as ordered later goals.
- **P6.6 cast threshold:** direct material player interaction promotes CastRoster; pre-contact identity needed by a
  key/wound/witness/lore/action remains a compact canonical actor/cohort exception outside player-contact cast.
- **P6.11 scale reminder:** actual scale is a recovered product law; governed fixed-camera readability cannot shrink
  mechanics or replace the existing corpus/true-scale pipeline.
- **G6.1 persistence cost/compression:** retain the simple Stub -> Working -> Developed semantic ladder, orthogonal
  active/site/cold and precision axes, and deterministic sparse normalization/dedup/chunking/retrieval before any
  replaceable byte codec. Storage is cheap per noun; duplication, context, serialization, migration, and eager
  simulation are the costs to gate.
- **P6.12/G6.2 evidence and groups:** Wave 6 overlays the retained evidence portfolio; typed contribution receipts
  and promotion triggers preserve mechanics without eager per-person turns.

Exact schemas, codec choice, numeric record/context/storage caps, state/tag catalogs, body measurements not supplied
by rules/content, crowd tuning, and final fixture order remain technical work for retained proof, Wave 11
measurement/workbench, and Wave 12 persistence/release specification. They do not alter the accepted behavior and
do not require another present design choice.

#### Original and additive coverage

| Family | Final phased disposition |
|---|---|
| **P6.1** | One entity plus versioned active BodyForm; D&D combat-control space remains distinct from posture/anatomy/render height; reuse/audit the existing corpus and true-scale paths |
| **P6.2** | Typed standing/transit/work/tactical/comfort/concealment/seating/load/overflow capacity consumes one geometry/reservation/occupancy truth |
| **P6.3** | SRD-first constrained traversal; ordinary DCs for meaningful remaining uncertainty; honest blockage/alternatives instead of physics or provider fiat |
| **P6.4** | Builder/original-use scale domains plus caused adaptation/mismatch; no retroactive current-resident resizing |
| **P6.5** | One advancing pre-alpha scene; exact self-inert waiting/cold records; C4D same-scene autonomy precedes transactional independent split lineages |
| **P6.6** | Anonymous untouched multiplicity remains cohort/ordinal; direct interaction promotes CastRoster; necessary pre-contact exact deltas stay compact and cannot average away |
| **P6.7** | Supported carriers/conveyances use typed reference frames/attachments/capacity/receipts while occupants remain independent citizens; breadth promotes by evidence |
| **P6.8** | One entity owns versioned forms; effect-specific engine events own space/stats/equipment/reveal/condition/reversion while identity/history stays singular |
| **P6.9** | Typed roles consume real capability/action/reaction/resource windows and receipts; exact turns only where rules require them |
| **P6.10** | Viewpoint-legal diegetic tells plus optional exact/accessibility projection communicate known scale/access/danger without leaks or universal visual noise |
| **P6.11** | Actual mechanical scale survives fixed-camera interim/future projection through governed composition/focus/cutaway/picking/text tools; camera and sprite pixels never own mechanics |
| **P6.12** | Incremental Wave 6 risk overlay on the retained twelve-site/eight-trace/Clay/P10.12 portfolio, with deterministic, provider, recovery, accessibility, capture, and measured-Mac evidence |
| **G6.1** | Player-contact CastRoster is a sparse identity spine plus canonical-owner references; Stub -> Working -> Developed semantic growth uses deterministic structural compaction and scoped retrieval |
| **G6.2** | Typed participation ledger over cohorts/exact actors/promotion triggers keeps cooperative scenes causal and bounded without eager simulation or prose-only modifiers |

#### Authority and contradiction audit

- Wave 6 owns the shared body/capacity/participation/cast-projection contract but does not replace D&D/SRD action,
  size, reach, movement, effect, or stat-block rules; Wave 2 actor/group/custody/active-site-cold ownership; Wave 3
  provenance-first spatial domains; Wave 4 connection/traversal truth; Wave 5 assembly/touched-state owners; Wave 7
  tactical affordance detail; Wave 8 broad mutation; or Wave 10 fixed-camera/performance/accessibility continuity.
- The older `DUNGEON-GRAPH.md` resident-scaled wording is implementation history constrained by later P3.4/P6.4:
  original builders/users or a committed causal alteration—not mere current presence—license scale domains.
- The existing roughly two-thousand-sprite corpus, `worldHeight`/`heightSource` registry provenance, true-scale
  renderer/guise paths, current place-scale scaffold, partial cast/group systems, lazy NPCs, touched props, and
  digest diet are preserved implementation evidence. None alone proves the unified accepted contract; none is
  deleted merely because the proof slice is narrower.
- Direct-contact CastRoster does not erase Wave 2's earlier canonical-NPC rooting law. A pre-contact causal actor
  may be compactly rooted outside CastRoster; player-contact promotion later links the same id without reroll.
- Stub/Working/Developed does not replace the tabletop attention ladder or active/site/cold ownership. Attention
  decides what consequence/ledger is owed; semantic tier records how much typed noun detail play has earned;
  activation/precision decides how that same canon is currently projected.
- Persistent text is not treated as free merely because bytes are small. The design protects years-long worlds by
  preventing duplication and whole-world synchronous/context work, measuring long-tail behavior, and deferring the
  replaceable physical codec to Wave 12 without deferring semantic correctness.
- R2 provides implementation warnings/evidence only. It does not reopen C1H composition, Wave 10 initiative/camera,
  existing tactics/morale, provider-neutral authority, or Wave 8 mutation ownership.

#### Phasing and traceability audit

The proposed [Wave 6 phasing audit](PHASING-AUDIT.md) separates pre-alpha-critical foundations, retained proofs,
playable MVP obligations, ideal goals, seams, and promotion triggers. No giant Wave 6 build is introduced.

The Clay Proof Ladder is reconciled through existing small vertical passes:

- **C1A/C1B/C1D** establish the BodyForm/registry projection seam, body-aware route preview, and mixed-scale exact
  BattleMat/EngagementLens citizenship without corpus replacement;
- **C1J/C1K** exercise typed guard-room capacity and one sparse touched-object Stub -> Working promotion;
- **C2B/C2D** preserve one concept/promise referent and the same sparse nouns through mode/precision/active-site-cold
  handoff;
- **C2G/C2N** prove PC-only wait/forced cold continuity plus SRD/DC-constrained ordered crossing and bounded rescue;
- **C4A/C4C** prove cohort ordinal -> direct-contact CastRoster promotion, three-tier sparse noun growth, and typed
  cooperative participation; and
- **C4D/C4F/C5** retain later same-scene autonomy, demonstrated transport depth, and incremental corpus breadth
  without pulling them into the first proof.

The Feature-Promotion Ledger now covers BodyForm/true scale/form continuity, typed activity capacity/constrained
traversal/access tells, waiting-party continuity, NPC pooling/player-contact cast, sparse three-tier semantic growth,
typed cooperative participation, dynamic carrier citizens, and the accumulated Wave 6 evidence overlay. Every
accepted ideal has a retained seam, owner, and promotion trigger; all implementation states remain unaudited.

Every P6.1-P6.12, G6.1-G6.2, and generated material follow-up therefore has a phased disposition. Wave 6 remains
**OPEN solely pending Adam's explicit closure agreement**. This audit does not claim implementation, schema/code
completion, evidence, CI, release readiness, or completion of the broader procedural-dungeon redesign. No code,
asset, dependency admission, worktree, LFS materialization, merge, push, or full CI is authorized.

### 15.8 Explicit Wave 6 closure — advance to the remaining canon-and-scope consolidation

Adam explicitly closes Wave 6:

> "ok, yes, let's close wave 6"

Wave 6 is **CLOSED** on the complete phased basis audited in section 15.7. This closure means every prospective,
additive, and generated Wave 6 question has an accepted disposition; earlier scale, cast, party, persistence, and
renderer authority has been reconciled; and every feature goal retains a proof/MVP/ideal destination, owner, and
promotion trigger. It does **not** claim implementation, dependency admission, passing evidence, CI, release
readiness, or completion of the broader procedural-dungeon redesign.

The unresolved questionnaire now consists of five subject waves: **Wave 7 — Tactical Affordances and Encounter
Reshaping; Wave 8 — Mutable and Destructible Environments; Wave 9 — DM Strategic Cards and Environmental
Authority; Wave 11 — Workbench, Clay Corpus, and Teaching Loop; and Wave 12 — Migration, Persistence, Acceptance
Gates, and Build Order**. Each retains P*.1-P*.12 plus additive G*.1-G*.2. Before ordinary sequential interviews,
Adam requests a Fable-led canon-and-scope organization pass that compares the closed-wave record with the scattered
design corpus, recovers inherited answers, proposes technical defaults, supplements missing questions, and creates
a clearer indexed canonical set without erasing historical authority. That pass may prepare answers and proposed
dispositions across the five waves, but it may not silently close a wave or convert genuine founder taste/product
choices into accepted canon. No build is authorized.
