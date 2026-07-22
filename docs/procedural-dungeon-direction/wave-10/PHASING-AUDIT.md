---
type: design-study
status: ACCEPTED
wave: 10
created: 2026-07-21
updated: 2026-07-22
---

# Wave 10 Prototype/MVP Phasing Audit

This accepted audit applies the prototype/MVP lens to the open visual-engine wave. It is deliberately stricter
about proving physical events than about immediately realizing every accepted interface, camera, material, history,
and presentation ideal. Adam accepted the revised cut and small-pass delivery reframe on 2026-07-21. P10.8 itself
still awaits explicit phased F10.8g closure in the running record. Terms follow the global
[phasing framework](../PHASING-FRAMEWORK.md).

## Pre-alpha-critical foundation

“Critical” below means the narrow contract must exist. It does not require mature polish or every content family.

| Decision family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Shared play shell | Left tool rail, central SceneTray/BattleMat, right provider-neutral DM-seat conversation/composer; no structured inspector takeover of the DM rail | This is the game's basic human/DM/world relationship and protects the clean prose lane Adam chose without binding the product shell to one LLM. |
| Mechanical spatial truth | Exact cells, legal path/target/area/topology/current-state authority for the mechanics present in the slice | A beautiful approximate map cannot be the game board. |
| Renderer authority boundary | BattleMat, EngagementLens, audio, cards, and prose consume canonical receipts; none directly mutates mechanics | Retrofitting this after presentation scripts own state would force a rewrite and duplicate effects. |
| Pre-alpha battle system | BattleMat owns exact tactical/spatial truth and a mandatory receipt-derived EngagementLens stages every material combat beat; at least one representative family receives complete bespoke performance while every other MVP combat verb receives truthful generic lens staging | The EngagementLens is the pre-alpha battle system, not optional polish; removing it changes the accepted game. |
| Representative physical event truth | At least one legible transition/performance for movement, attack, hit/damage/down, core condition, door/object state, topology change, hazard, destruction, and drop/custody; truthful reduced fallback covers unsupported variants | Adam's gating question is whether actual canonical events can be rendered and understood, not merely whether terminal fields change. |
| Stable identity and secrecy | Stable ids/speakable encounter labels; every projection obeys viewpoint knowledge and reveals no hidden slot/count/source | Labels and leaks become embedded in prose, saves, and player reasoning. |
| Mechanical activation order | Exact deterministic initiative/activation/reaction ownership, even if first UI is plain | Presentation may simplify; action legality and time cannot. |
| Validated interaction | Clicked objects expose only eligible validated actions and never mutate state directly | The object card can be simple, but it cannot become a second rules engine. |
| Durable consequence/recovery seam | Receipt/event ids, terminal state, idempotent recovery, and no mechanical replay after skip/load/crash | Fancy interrupted choreography may wait; duplicated damage and lost custody cannot. |
| Fictional consequence minimum | Every supported DM-seat model receives exact fact anchors and implemented mechanics/actions; core receipt families have a viewpoint-safe natural-language fallback | The DM rail cannot block forever, change mechanics by provider, or dump `ward spent` when a model fails. |
| Playable visual floor | Existing usable sprites/lighting/material citizenship is preserved, and the MVP has coherent silhouette, value, elevation, light/shadow, prop, and sprite readability at gameplay scale; missing bespoke assets/effects fall back visibly and truthfully | A debug-looking board may prove data flow but is not an honest playable pre-alpha or the accepted tabletop identity. |
| Shared battlefield composition floor | One real-roll retained room has coherent elevation masses rather than cell noise, mechanically shared visible connectors, a readable primary route, honest deployment/objective reservations, and tactically honest fixed-production-view behavior across governed focus/cutaway states; BattleMap and TownTray retain one geometry authority | Exact cells alone can still produce a random-looking, strategically empty board, and separate town/battle generators would make same-venue continuity structurally false. |

## Proof/MVP scaffold -> feature goal

The `Pre-alpha form` column means the playable MVP. The earlier physical-event proof may temporarily omit some of
this presentation, but passing that diagnostic gate does not redefine the MVP downward. Borderline behavior stays
in the MVP with narrow breadth.

| Decision family | Pre-alpha form | Accepted feature goal | Seam retained now | Promotion trigger |
|---|---|---|---|---|
| Responsive shell | One supported desktop layout and conservative minimum viewport | Three proof viewports, tablet behavior, and robust rail/tray adaptation | Named layout regions and CSS/layout ownership boundaries | The desktop event corpus is green and the next player/device cohort is chosen. |
| Object-card placement | A safe fixed edge or simple left/right choice that never covers the target or critical action controls | Smart quadrant/occlusion placement with scroll/context preservation | One clicked-object inspector component with anchor/eligible-action inputs | Card obstruction or cursor travel is a measured playtest problem. |
| Route preview | One exact legal route plus player agency over materially different paths through either a shortest/safer alternative or manual waypointing; known hazards and locked extensions remain honest | Richer resource-aware alternatives, interruption policy, route comparison, and bounded undo | Route candidate/result ids and explicit preview-versus-commit boundary | Real hazards/resources create choices the narrow alternative cannot express clearly. |
| Rooted callback labels | Numbered/type labels remain stable across relevant revisits; names the player learns replace or accompany them without identity reset | Monotonic cross-scope callbacks, multiple remembered aliases, and richer historical naming | Stable entity id distinct from current display label | Longer returns or several aliases make the persistent minimum ambiguous. |
| Receipt cue scheduling | Store the accepted dependency-bearing causal group, but initially execute it serially with typed truthful fallbacks | Legal sibling overlap, repetition compression, channel arbitration, and rich choreography | Receipt/presentation ids, hard dependencies, causal group, terminal obligation | Serial playback becomes slow after the representative corpus is correct. |
| Input during consequences | Gate consequential world commits during material cues while always preserving composer draft, DM scrolling/reading, and non-destructive inspection state | Truth-complete decision boundaries, one pending intent, and fine-grained safe input | Explicit committed/uncommitted intent state and decision-boundary signal | Players frequently fight the gate or lose planning flow despite preserved non-destructive state. |
| Interrupted presentation | Rebuild exact terminal board/card state and let the DM-seat model/fallback recap missed known consequences | Semantic owed-obligation checkpoints, reduced-motion equivalents, and richer pending-state restoration | Canonical event cursor plus terminal/owed presentation records | Save/load/background tests show important consequences are not understood. |
| EngagementLens breadth | Mandatory selected/active-actor lens on every material combat beat, with target/opponent presence, generic truthful staging for every MVP verb, one complete bespoke combat family, material outcome feedback, and deterministic return to board truth | Full selected-PC active-follow, stable faction sides, broad bespoke combat citizenship, governed animation, and richer transitions | Derived adapter keyed to canonical actors/receipts; no mechanics ownership | Generic staging is readable but additional verbs, crowd states, or transitions need bespoke performance. |
| Initiative presentation | Plain portrait/text row or compact ordered list | Winner-first faction blocks, smart crops, overflow, reinforcements, allegiance transfer animation | Stable activation entries and deterministic ordering separate from layout | Larger encounters are mechanically correct but hard to scan. |
| Physical props and materials | Cheap primitives/derived faces and a small prop kit are acceptable only inside the critical playable visual floor; existing working lighting/sprites/features are retained | Routed materials, normals, richer shadows, realm skins, broader props, and the mature hybrid beauty target | Semantic surface/prop role and deterministic asset fallback | Native-resolution captures meet the visual floor and material sameness is now the limiting defect. |
| Procedural BattleMap/TownTray composition | C1A first exposes stable composition/surface ids and clay diagnostics; C1H then proves one intentional real-roll battlefield with broad elevation masses, typed connectors, primary route, licensed landmark or structural dominant, reservations, negative space, dressed parity, and fixed-production-view truth across governed focus/cutaway states; C2M reuses the same compiler for the market venue | Structural risks distributed across the twelve named golden sites, richer dungeon/town/wilderness recipes, optional stacked surfaces, and an offline unwrap foundry for reusable complex assets | One `TacticalCompositionPlan`/surface-frame boundary; current world/perimeter UV projection remains valid; layer id reserved at zero | The retained room remains noisy or empty, dressing changes tactics, the production view hides critical relations after legal repair, town requires a fork, new structural families expose missing grammar, or a complex reusable asset actually requires offline unwrap. |
| Architectural trim sheets | C1I follows C1H with one manifest-driven horizontal layout and one architecture-material family: independent source strips pack deterministically; named procedural runs use physical scale, clamped bands, repeat-boundary segmentation, explicit corner/endpoint/occlusion ownership, and geometry/plain fallback; clay tactics remain unchanged; C2M reuses the same authority | Broader material families, physical profile sweeps, roof/beam/frame/bridge/town roles, aligned normal/ORM channels, dedicated junction components, and measured shader/batching optimization | Stable layout/slot/run ids, canonical-material-first selection with secondary realm grade, deterministic provenance/fold reports, and geometry-owned silhouettes | C1I proves the contract; later captures show material sameness or missing silhouettes, town exposes a new role, or P10.10 shows geometry segmentation should promote to a shader. |
| Camera behavior | Current/gentle view, simple bounded auto-fit for truly offscreen material events, skip/recenter | Governed overview/room/action ladder and player-owned Option B focus leases | Typed focus request and policy adapter; terminal restore target | A-versus-B tests show automatic direction interrupts reading/typing or misses events. |
| Attention and accumulated-history UI | Store exact events/knowledge; project current truth on BattleMat, consequences in DM prose, and detail through clicked cards | Ambient -> noticed -> relevant -> active -> historical ladder, progressive holder-aware cards, causal remounting | Durable event/discovery ids, viewpoint knowledge, relevance/attention state as data rather than visual ownership | Comprehension tests fail despite truthful board state, prose, and invoked inspection. |
| Durable history lifecycle | Exact canonical history plus a short viewpoint-known recap/current card state | Coalescence, aging, bounded traces, remount envelopes, opportunity resilience, and expressive retelling | Append-only causal identity, current projection, viewpoint knowledge, retirement reason | Long sessions make exact history noisy or cause unresolved discoveries to disappear from play. |
| Consequence information layer | **No automatic brief in the first target**; use physical board truth, normal status/action surfaces, DM-seat/fallback prose, and clicked inspection | Only the narrow structured aid evidence proves necessary; the rejected raw mechanical dump never becomes the goal | Shared receipt ids allow a later adapter without changing mechanics | BattleMat-plus-DM-seat tests show a repeatable material comprehension failure other surfaces cannot repair. |
| DM-seat clause breadth | Several context-slotted variants for each representative core family so fallback remains fictional and does not immediately sound like a dry second voice | Broader combination, localization, tone, provider conformance, and context-compacted recovery | Typed anchor schema, available-mechanics contract, and validated forward-only narration contract | New mechanics or supported models lack a natural truthful fallback, or longer fallback runs become materially repetitive. |
| Property and custody projection | Current holder/location plus a visible state change and plain fictional account | Title, claims, licenses, disputed ownership, and holder-aware history surfaces | Exact unique-item identity/custody and separate attributed-ownership relation | The playable slice introduces theft, lending, claims, or contested ownership as core choices. |
| Bounded town continuity | One compact district graph mounts reusable real-roll venue grids; exact journey arrival and a short Urban Walk/direct threshold lead to market interaction -> same-venue BattleMat -> changed aftermath -> bounded offscreen update -> symmetric leave/return; material citizens promote; one cross-edge escalation preserves lineage when needed; witness/evidence facts may create an owner-governed civic obligation; transport has a truthful custody/access anchor; clocks/conditions gate venue access; disposable geometry compacts semantically | Selected contiguous slices, richer ambient citizens, enabled same-scene companion roaming, C4F transport depth, broader venue families, and owner-governed cross-venue events; later social/world owners add law/investigation/faction-response breadth | Stable venue/edge/threshold ids, SceneLineage, precision compaction, rooted-NPC promotion, evidence/viewpoint facts, transport custody/access, canonical access conditions, and dormant certified action/attention hooks | The retained C2M fixture is correct but feels like disconnected menus, loses pursuit/civic/transport/access/departure truth, or cannot support the next promoted town behavior. |
| Visual proof corpus | A deterministic MVP corpus for the actual verbs above at gameplay scale, including both accepted contrasting site configurations and the required EngagementLens battle family | Multi-viewport beauty, materials, crowded cues, interruption, accessibility, and performance matrices | Reproducible scenarios and stable capture points | Each scaffold earns its richer acceptance gate; P10.10/P10.12 set budgets. |

## Recommended Wave 10 pre-alpha slice

The proof prototype first demonstrates that canonical physical events and terminal state can render truthfully. The
playable desktop MVP then shows a party moving through exact cells with material route agency; opening, failing,
breaking, and changing an object; attacking and applying damage/down/one condition; changing a door or topology;
revealing one known hazard; dropping/transferring one unique object; and recovering exact terminal state after
interruption. Core events receive legible transitions, not state snaps alone. The mandatory EngagementLens stages
every material combat beat, gives at least one family a complete bespoke performance, and uses truthful generic lens
staging for the other MVP combat verbs while remaining receipt-derived from BattleMat truth. The selected DM-seat model narrates
committed fact anchors, with several context-slotted fictional fallback variants for those families. Presentation
may remain serial, cards may place conservatively, initiative may be plain but complete, and camera movement may be
minimal.

The MVP also meets the accepted coherent tabletop visual floor and preserves working capabilities; cheap assets do
not license a debug-looking game. Only after the physical-event corpus and this playable floor work at gameplay
scale should pre-alpha spend substantial time on rich material breadth, smart card placement, parallel cue
choreography, multi-step camera governance, progressive history UI, or additional consequence information layers.
Store the ids, receipts, dependencies, knowledge, and policy seams those goals require from the beginning.

The high-priority composition module follows the same staging discipline. C1A first exposes stable
composition/surface ids and a clay diagnostic over the existing room; C1D proves the playable BattleMat plus
EngagementLens spine; C1H then proves one intentionally composed real-roll battlefield before broad travel/town
recipe rollout. This retains a narrow first proof without accepting random-looking height/prop scatter as the
pre-alpha map floor. C1I then proves one manifest-driven trim sheet as a separate primary risk; it cannot make C1H
pass and does not require mature profile, channel, material-family, or shader breadth. C2M must reuse the same
composition and trim-surface products for its market venue.

## Decisions that this audit changes operationally

- The mature dependency-aware scheduler remains the destination, but its first presenter may be serial.
- Fine-grained safe input/pending intent remains the destination, but a conservative world-action gate may ship
  first if drafts and non-destructive state are preserved.
- Rich semantic interruption catch-up remains the destination, but exact terminal rebuild plus a known-consequence
  recap is the first gate.
- The EngagementLens is mandatory for playable pre-alpha. Only its breadth and mature direction are scaffolded; an
  event-rendering proof without it is an engineering milestone, not the pre-alpha battle system.
- Automatic focus Option A is only a starting scaffold; the typed focus seam and A-versus-B evidence remain
  mandatory, while elaborate directing does not precede physical event proof.
- The P10.7 attention/history direction remains the feature goal. Its canonical history and knowledge contracts are
  critical; its full ambient-to-historical visual projection is not.
- F10.8e's automatic consequence brief remains outside the first target and gains no automatic later entitlement.
  It reopens only from observed comprehension failure.
- Trim-sheet work begins only after composition is proved in clay: C1I accepts one manifest/material family and
  repeat-safe base-color run contract, while profile/channel/material breadth and shader optimization remain named
  promotions. The scaffold cannot become a reason to delay C1D or let decorated geometry excuse a weak C1H map.

## P10.8 closure disposition

Adam explicitly closed P10.8 on the phased basis at running-record section 11.69. Critical seams and representative
physical verbs remain first; named presentation goals remain active promotions in the feature ledger. P10.9 is now
active and mandatory.

## P10.9 closure disposition

Adam accepted the final bounded mechanically stateful CrisisChain MVP phasing at running-record section 11.100.
Section 11.101 then closed P10.9 on its phased basis after auditing every original mode, authority boundary,
contradiction, proof/MVP/feature mapping, and generated follow-up. The first connected continuity obligation remains
the typed SceneLineage C2D handoff; C2A-C2C, C2G-C2M, and C4C add retained bounded traces rather than one universal
world simulation. Full owner-specific crisis fail/replan, richer cross-mode presentation, broader investigation,
and deeper simulation remain promoted goals with named triggers. P10.10 is now active and mandatory; this closure
does not close Wave 10 or authorize a build.

## P10.10 closure disposition

At running-record section 11.103 Adam accepted measured semantic-invariant quality tiers, the 60-preferred/30-floor
law, presentation-before-semantics degradation, and bounded accessibility equivalence. His current Intel MacBook
Pro is the prototype target rather than the high-beauty ceiling or an automatically declared release minimum.
Keyboard/mouse comes first and voice is a close next priority; controller/touch/tablet release timing remains live.
Section 11.104 maps local Mac low-tier proof, rented GPU high-tier evidence, real-device functional checks, and
assistive-technology checks without treating any one service as all-device truth. Section 11.106 accepts the Mac
low-tier floor, defers the cloud lane until the connected local proof earns it, puts keyboard/mouse in the playable
MVP and voice next, chooses editable push-to-talk drafts, and requires configurable causal-beat accessibility.
Section 11.108 accepts measured hardware/frame evidence, player-controlled tier/memory/input/privacy/accessibility
policy, and exact nonvisual spatial access. Its anti-pop amendment allows ordinary mip/visual LOD streaming only
after a coherent lower-tier scene with exact tactical truth is ready; noticeable upgrades wait for a safe boundary
or stay deferred. Section 11.110 accepts outcome tiers, governed reveal/refinement/Auto, identity-safe crowds,
focus/voice/audio arbitration, spatial ordering, and the eventual need for human accessibility evidence. It also
records the current roughly $200/month Claude/Codex spend as the cash ceiling: the local Mac, retained fixtures,
built-in VoiceOver, and cost-free automation form the present proof; paid hardware, voice vendors, compensated
research, contractors, and hiring require a later evidence-linked funding gate. Section 11.112 accepts the entire
F10.10a.4-e.10 resource batch Option B. The explicit section 11.113 audit finds every original and generated branch
answered, resolves the tablet/touch, Mac/reference, accessibility/validation, streaming/pop, and ideal/current-cash
boundaries, and maps retained proof to C1A/D/F/G/H/I and C2M while assigning asset/cache mechanics to P10.11 and the
same-state release bakeoff/claims to P10.12. No unmapped row or ownerless feature remains. P10.10 awaits Adam's one
numbered Option B closure confirmation. Adam accepted that confirmation at section 11.114. P10.10 is closed on this
phased basis; no build or Wave 10 closure is implied.

## P10.11 closure disposition

Section 11.115 opens ten questions over stable semantic visual slots, deterministic admitted resolution, optional
nonblocking exact-art enrichment, shipped/local/save ownership, offline/corrupt fallback, asset admission,
provenance/licensing, migrations, old-renderer retirement, and shipped-versus-local distribution. Section 11.116
then prevents unnecessary founder rubber-stamping: F10.11a, b, d, e, g, and h have strong technical Option B
defaults Codex can carry; F10.11f needs Adam's taste on actual retained captures rather than schema; F10.11c, i, and
j keep safe Option B policies until a real enrichment flow, P10.12 bakeoff, or distribution/economics evidence
exists. Adam accepts that authority split at section 11.117. Section 11.118 resolves the generated compatibility,
safe-rebind, cache pin/evict/cleanup, import/export, generation-consent, rights-state, appearance-pin, retirement-
evidence, and zero-cash branches. The explicit section 11.119 audit finds no current technical gap, contradiction,
unmapped lifecycle concern, or ownerless goal; deferred taste/product choices keep named triggers. P10.11 awaits
Adam's one numbered Option B closure confirmation. Adam accepts it at section 11.120. P10.11 is closed on this
phased basis; its later taste/product gates remain live promotions rather than missing decisions.

## P10.12 closure disposition

Section 11.121 opens the release-tray bakeoff with explicit decision-authority labels. The accepted full destination
remains twelve golden sites, eight adversarial transitions, deterministic/property/human layers, and the twenty VQ
frames as visual relationship targets. The first proof remains one small retained dungeon slice. F10.12a-d, g, and
h carry Codex/evidence defaults; F10.12e returns to Adam only on real gameplay-scale captures; F10.12f and i require
later funded human evidence appropriate to the claim; and F10.12j reserves final release selection for Adam after
hard gates and representative tradeoffs exist. Adam accepts that split at section 11.122. Section 11.123 resolves
fixture/candidate admission, veto, matched/best-legal capture, provider-control, milestone-sufficiency, systemic
visual-iteration, human-claim, and selection-record branches. The explicit section 11.124 audit finds no current
evidence-method gap, contradiction, unmapped inherited case, or ownerless goal; future capture/hardware/human/final-
selection outcomes remain correctly evidence-gated. At section 11.124 P10.12 awaited one numbered Option B closure
confirmation; Adam accepts it at section 11.125. P10.12 is closed on this phased basis;
future capture, human-evidence, taste, and final-selection gates remain live promotions rather than completed work.

## Additive G10.1-G10.2 disposition

Section 11.126 corrects the stale grouped-open wording: G10.2 was already fully audited and explicitly closed with
P10.7 at section 11.56, then re-audited without contradiction during P10.8. It is not reopened. Sections 11.127-
11.128 consolidate G10.1 as a dynamic-citizen truth invariant rather than an entitlement to speculative mechanics.
The first proof is one moving dungeon lift/passenger/item catastrophe on Adam's Mac; the playable MVP retains exact
receipt-driven mount/update/drop/crash/remount/rebuild across BattleMat, EngagementLens, aftermath, recovery,
accessibility/low tier, and provider-neutral DM narration. Bounded nested transports, transactional split-party
lineages, and cross-realm transitions remain feature goals activated only by real owning mechanics and retained
adversarial traces. Canonical versus renderer parentage, relation typing, cycles, precision downgrade, offscreen
ownership, missing art, and proof growth are technically dispositioned. At section 11.128 G10.1 awaited one
numbered Option B phased-closure confirmation; Adam accepts it at section 11.129. G10.1 is closed on this phased
basis; all later promotion and retained-proof gates remain binding.

## Final Wave 10 audit disposition

Section 11.130 rechecks P10.0-P10.12, G10.1-G10.2, all generated follow-up roots and later families, composition/
trim tangents, contradictions, proof/MVP/ideal ownership, preservation, and the Feature-Promotion Ledger. It finds
no unanswered current question, undispositioned material follow-up, unresolved contradiction, unmapped decision
family, or ownerless accepted feature goal. Implementation and evidence states remain unaudited. Section 11.131
clarifies the larger sequence; section 11.132 records Adam's explicit Option B whole-wave closure and advances to
Wave 3. All prototype/MVP/ideal promotion and evidence gates in this audit remain binding after closure.
