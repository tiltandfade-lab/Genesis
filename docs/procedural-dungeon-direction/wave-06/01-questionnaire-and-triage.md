---
type: design-study
status: OPEN
wave: 6
part: 1
legacy_sections: "15-current"
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
