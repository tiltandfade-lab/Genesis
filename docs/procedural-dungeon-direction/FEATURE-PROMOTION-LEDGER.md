---
type: design-study
status: ACTIVE
created: 2026-07-21
updated: 2026-07-22
scope: opened-wave feature traceability
---

# Procedural Dungeon Feature-Promotion Ledger

This ledger prevents accepted behavior from disappearing between large design waves and small implementation
passes. It maps decision families, not every historical subquestion; the chronological wave records remain the
semantic authority. Pass ids resolve through the [Clay Proof Ladder](CLAY-PROOF-LADDER.md).

All implementation states below are **UNAUDITED**. A mapping is not a claim that current code lacks or already
satisfies the feature, and it is not build authorization.

## Ledger laws

1. Every accepted or provisionally accepted decision family gets an MVP obligation or an explicit evidence-gated
   non-applicability disposition, an ideal feature goal, a first proof pass, an MVP gate, and a promotion trigger.
2. `Later`, `polish`, or `Wave 12` alone is not an owner. The destination and trigger must remain named.
3. Future design-wave closure audits must check ledger coverage in addition to original/additive/generated question
   coverage. This is traceability, not a replacement for Adam's explicit semantic closure.
4. Passing a proof changes a row to `PROVED`, not `MVP`. The row becomes `MVP` only when its playable obligation
   passes in the integrated slice. Mature promotion is recorded separately.
5. A failed pass reopens the row's named seam or scope. It does not erase the accepted destination.
6. New Waves 3-9/11-12 decisions append or refine rows; they do not become giant same-numbered implementation waves.
7. The first connected implementation priority is the retained canonical-mechanics -> BattleMat plus EngagementLens
   -> Gemini/fallback -> persistence/recovery spine. Other accepted families become small vertical modules over its
   owners; prose may bridge absent breadth but cannot count as committed mechanics or erase the mapped destination.

## Initial opened-wave mapping

| Decision family | Playable MVP obligation | First proof | MVP gate | Ideal feature goal / later owner | Promotion evidence | State |
|---|---|---|---|---|---|---|
| Site identity, provenance, canon commitment | Stable purpose/builder/current-use/provenance ids; committed facts do not reroll | C1A | C3A/C3C | Richer history/institution breadth; Waves 3-5 | Contrasting sites preserve identity without special cases | MAPPED; implementation unaudited |
| Truth, knowledge, and claims | Canon truth, viewpoint knowledge, and unverified belief remain distinct | C1A/C1G | C2B/C4B | Graded knowledge/remount/claim projection; Waves 9-10 | Secret/callback corpus shows no leaks or false certainty | MAPPED; implementation unaudited |
| Functional roster and site scale | Small site contains the capabilities/rooms its purpose requires | C3A | C3C | Multi-family scale/domain accommodation; Waves 3/6 | Additional families/scales cannot fit the small roster grammar | MAPPED; implementation unaudited |
| History and current occupation | One or two transformations visibly alter present rooms/use | C2C | C3A/C3C | Deep time-indexed cascades and layered occupation | Longer callbacks require more than shallow ordered history | MAPPED; implementation unaudited |
| Repetition and Spice | One repeated family varies locally; one scoped Spice root remains coherent | C3A | C3C | Hierarchical assemblies and multi-scope Spice; Waves 3-5 | Larger/denser sites clone or lose motif control | MAPPED; implementation unaudited |
| Discovery and DM obligations | At least one stable cross-room promise/payoff and small obligation queue | C2B | C4C | Discovery networks, strategic hands, full attention ladder; Waves 9-10 | Longer play loses or over-repeats promises | MAPPED; implementation unaudited |
| Party/social/inventory minimum | One player-owned main PC; allies/sidekicks remain canonically present through a party anchor and coarse set formation outside combat; `inside`/`at portal`/`adjacent` participation and exact tactical separation remain one advancing party scene; the deterministic resolver deploys the whole party inside an approach-bounded legal zone, after which allies act independently; pre-alpha has no voluntary split command, off-focus companion scene, or branch reconciliation; forced persistent separation becomes a self-inert cold record that retains identity/location/custody/condition/inventory/knowledge, may receive externally owned world consequences, and remounts exactly; one persistent dungeon relationship and exact consequential item custody; narration alone cannot detach or advance a companion | C1C/C1D/C2D | C2D/C2G/C4A/C4B plus later Wave 6/7 behavior gate | C2E adds player placement plus optional formation-legal ally rearrangement; C4D adds toggleable `Off`/`Cautious`/`Characterful` bounded same-scene autonomy under certified actions, risk ceilings, hard red lines, perceptible attempt/intervention law, and governed same-scene attention; C4D must precede independent parent/child split-party lineages; richer formations/commands, social places, and inventory ecology remain Waves 5-7/9/12 goals | Automatic deployment feels unfair/disconnected, same-scene companions feel inert, bounded autonomous acts feel like approval spam/invisible sabotage/camera theft, or later autonomous/split-party play cannot fit retained seams | MAPPED IN PART; cold separation and exact C4D continuity/presentation boundary accepted; Waves 6-7 behavior detail open |
| Canonical active/site/cold ownership | One owner and idempotent handoff for actors/items/groups/stocks/clocks/facts | C1F | C3B | Broader compaction and migration; Wave 12 | Long absences or new families exceed bounded owner forms | MAPPED; implementation unaudited |
| Site operation, resources, and external contract | One visible stock/obligation flow, bounded clock, external contract, intervention, and return consequence | C3A | C3B | Multi-family ecology/regional reconciliation; Waves 8/12 | More sites need dependencies the bounded contracts cannot express | MAPPED; implementation unaudited |
| NPC pooling and rooting | Several role candidates remain provisional; one legally roots and persists | C4A | C4A/C4C | Rich reusable casting precedents and social graph; Wave 11 | Repeated encounters lack variety or continuity | MAPPED; implementation unaudited |
| Multiple groups and changing relations | At least two groups plus one legal relation/control change | C4A | C4C | Dynamic contested operation and politics | Three-way/longitudinal conflict exceeds small relation set | MAPPED; implementation unaudited |
| SceneFact promotion and private deliberation | Every candidate family used by MVP has validated promotion; private candidates cannot mutate canon | C4B | C4C | Certified precedents and richer DM deliberation; Wave 11 | Repeated valid inventions require one-off handling | MAPPED; implementation unaudited |
| CrisisChain | One bounded fork/convergence over existing owners and ordinary actions | C4C | C4C | Branching multi-actor orchestration | Parallel/nested crises exceed the small graph | MAPPED; implementation unaudited |
| Critical magnitude | Full accepted ladder, including Mythic/Worldbreaker, for representative MVP verbs | C1E | C1E/C4C | Outcome-profile breadth across every domain | New verbs lack certified extreme consequences | MAPPED; implementation unaudited |
| Shared shell and renderer boundary | Left rail, BattleMat/SceneTray, clean right DM rail; projection never owns mechanics | C1A | C1G | Responsive/device-rich shell; P10.10 | Target devices or mode continuity expose layout/ownership gaps | MAPPED; implementation unaudited |
| BattleMat spatial truth and event performance | Exact cells/routes/targets/topology/state plus legible core physical transitions | C1A/C1B | C1D/C2C | Broad event families and presentation choreography | Generic fallbacks obscure material outcomes | MAPPED; implementation unaudited |
| EngagementLens battle system | Lens stages every material combat beat; one family bespoke, other MVP verbs generically truthful | C1D | C1E | Broad bespoke families, active-follow/faction direction | Generic staging is correct but insufficiently expressive | MAPPED; implementation unaudited |
| Object interaction, route agency, custody | Validated clicked actions, material route choice, visible object/custody change | C1B/C1C | C2C/C4B | Smart placement, richer route comparison, claims/title projection | Playtests show obstruction, ambiguity, or insufficient choice | MAPPED; implementation unaudited |
| Initiative and causal cue order | Exact activation/reaction order; dependency-bearing cues may present serially | C1D | C1E/C1F | Faction ribbon polish, sibling overlap, compression | Serial presentation or plain order becomes hard to read | MAPPED; implementation unaudited |
| Consequence input and recovery | Preserve drafts/reading/inspection; gate commits; terminal rebuild and recap never replay mechanics | C1F | C2C | Pending intent and semantic owed-obligation recovery | Players lose planning flow or miss consequences | MAPPED; implementation unaudited |
| Gemini consequence language | Fact-locked prose plus several context-slotted fictional fallbacks for core families | C1C/C1G | C2B/C4C | Broad variation/tone/localization and compacted recovery | New verbs or longer failures become dry/repetitive | MAPPED; implementation unaudited |
| Camera/focus policy | Minimal bounded auto-fit, skip/recenter, preserved safe state; Option A starts | C1D/C1F | C2C | Player-owned Option B focus leases and governed ladder | A/B tests show interruption or missed events | MAPPED; implementation unaudited |
| Attention and accumulated history | Exact event/knowledge truth, DM prose, current board/card truth, invoked inspection | C1F/C1G | C2B/C3B | Ambient -> historical ladder and progressive history cards | Repeated comprehension failure survives existing surfaces | MAPPED; implementation unaudited |
| Visual floor, props, and materials | Coherent tabletop silhouette/value/elevation/light/prop/sprite citizenship; retain working features | C1A | C1E/C3C | Rich material routing, normals, realm skins, broad props | Captures meet readability floor and material sameness is limiting | MAPPED; implementation unaudited |
| Mode continuity | Typed idempotent SceneLineage handoff preserves lineage, ownership, cast/roles, objects/custody, damage/traces/hazards, viewpoint knowledge, obligations, consequence cursor, and recovery across exploration -> battle -> aftermath; spatial facts retain an honest exact/anchored/zone-or-route/unresolved tier and provenance-bearing placement/compaction receipt; pre-alpha staging is an orientation-preserving crossfade/reframe plus one short fiction-first Gemini/fallback bridge and no mechanical summary; broader required adapter traces remain owned by open P10.9 | C2D | C2D plus remaining P10.9-named MVP traces | C2F restrained landmark/placement continuity beat; seamless morphs, richer camera memory, simultaneous split-view presentation, broad adapter polish | Correct handoffs remain disorienting, or travel/town/split-party cases exceed the shared bundle | MAPPED IN PART; F10.9a-d accepted, generated P10.9 follow-ups active |
| Land-travel, route, transport, and macro-biome continuity | Every journey endpoint is a canonical node; one shared TravelWalk/SceneLineage contract owns staged deterministic segment commitment, departure/cursor/clock/arrival/turnback, material promotion, and travel-to-battle return while route baseline canon remains distinct from journey-specific time; a prose-led interim camp still calls the real short/long-rest owner and resumes the same cursor; a small rational macro-biome field refines locally without contradicting known geography and consumes the retained Fray/Spice authority rather than duplicating it; early transport is only truthful possession/access plus rider/driver capability linked to the existing animal citizen or item identity | C2H after C1A-D core | C2I/C2J plus final F10.9g travel-to-battle/visual trace | C4E ordered probability matrix, explicit camp choices, specialized per-mode assemblers, and selected physical route forks; C4F horse/wagon custody, capacity, condition, upkeep, and interaction over retained animal/inventory owners; generated road topology/conditions | The connected BattleMat spine is green; correct shared travel becomes repetitive or implausible by mode; route/world scale exceeds retained constraints; play demonstrates that a transport distinction earns its cost | MAPPED IN PART; F10.9g.1-g.15 accepted with A -> B branch/camp phasing; final travel audit active |
| Bounded town continuity | A compact canonical district/venue fabric reuses Urban Walk and SceneLineage; one market/district trace preserves cast, objects, thresholds/routes, damage, knowledge, and consequences through social/exploration/battle/aftermath mounts | Later P10.9 town proof | P10.9-named MVP trace | Scoped contiguous town slices, ambient citizens, companion roaming, and cross-venue events; no entitlement to simulate every street/building/resident | Bounded fabric feels like disconnected menus or cannot host accepted same-scene social/companion consequences | MAPPED IN PART; F10.9h direction accepted, generated town follow-ups open |
| Performance/device/accessibility | Reserved for P10.10; no cut inferred here | Later owner | P10.10 owner | Accepted device/performance/accessibility destination | Pending P10.10 answers and budgets | UNMAPPED pending mandatory P10.10 |
| Twelve-site/eight-trace portfolio | Grow retained fixtures incrementally after C1-C4; do not batch all sites first | C1A onward | C5 | Wave 11 corpus automation and Wave 12 release gates | Missing coverage dimension justifies each added site | MAPPED; implementation unaudited |

## Design-closure status

- P10.8 transitions/verbs closed explicitly on its phased basis at Wave 10 running-record section 11.69.
- P10.9 F10.9a accepted the transactional SceneLineage handoff and added C2D as the first retained continuity proof;
  F10.9b accepted typed precision tiers with provenance-bearing placement and compaction receipts. The family is
  mapped only in part. F10.9c assumes one player-owned main PC, formation-bound companions outside combat, and
  independent allied combat action; F10.9c.1 chooses automatic whole-party formation deployment for pre-alpha and
  maps player-PC placement plus optional ally rearrangement to C2E as the explicit feature goal. F10.9d chooses a
  simple crossfade/reframe plus fiction-first Gemini bridge for pre-alpha and maps the restrained diegetic continuity
  beat to C2F; a mechanical continuity summary remains evidence-gated. F10.9e excludes independently advancing
  split-party play from pre-alpha in favor of one scene with participation roles and reserves transactional child
  branches as a later feature. F10.9e.1 chooses a self-inert cold companion record with externally owned world
  consequences and exact remount. Same-scene companion autonomy is prioritized at C4D before split-party work;
  F10.9f-f.2 accept bounded certified action authority, perceptibility/interruptibility-gated intervention, and
  governed same-scene attention, while Waves 6-7 still own detailed behavior. F10.9g.1-g.15 accept one shared staged
  TravelWalk contract before specialized assemblers, baseline-route versus journey-time separation, deterministic
  segment commitment, material-outcome promotion, an ordered exposure/event/content matrix, coherent macro-biomes
  with constraint-preserving refinement, and bounded mechanical choices that may later become selected physical
  route branches. Option A weight choices may scaffold the desired bounded Option B fork; its pre-alpha timing
  remains open at F10.9g.12a. Macro-biome disorder and travel gates consume the existing Fray/Spice authority rather
  than minting a duplicate curve. A prose-led interim camp must still call the canonical short/long-rest owner and
  resume the same journey; explicit day-boundary camp choices are the later promotion. Transport begins with
  minimal truthful possession/access and rider/driver capability linked to the retained animal citizen or item
  identity; the later C4F module adds only demonstrated horse/wagon integration needs, never a mandatory full
  simulation. C2H-J/C4E-F own the staged proof/promotion path after the small-room BattleMat/EngagementLens core.
  F10.9h accepts bounded canonical town fabric before scoped contiguous-town enrichment. Generated P10.9 follow-ups
  still own fork timing, travel-to-battle remount, initial travel visualization, turnback/reroute truth, Gemini's
  scaffold authority, the town follow-ups, CrisisChain, and broader recovery/visual-memory obligations before its
  MVP gate can be complete.
- All implementation states remain unaudited and no build is authorized.

## Required update rhythm

- **After a design ruling:** update its MVP/ideal/trigger mapping before advancing past the generated follow-up.
- **At a design-wave audit:** report unmapped rows and ownerless feature goals explicitly.
- **Before specifying a Clay Pass:** replace family-level language with exact inputs, outputs, files, dependencies,
  fallbacks, and gates after auditing current code.
- **After a pass lands:** attach evidence and status; retain the fixture.
- **At MVP consolidation:** prove every critical/borderline row in an integrated playable trace, not only isolated
  fixtures.
- **At feature promotion:** record why the trigger fired and which retained MVP seam was extended.
