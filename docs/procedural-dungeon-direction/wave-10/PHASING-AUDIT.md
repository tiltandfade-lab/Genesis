---
type: design-study
status: REVIEW
wave: 10
created: 2026-07-21
updated: 2026-07-21
---

# Wave 10 Prototype/MVP Phasing Audit

This first-pass audit applies the prototype/MVP lens to the open visual-engine wave. It is deliberately stricter
about proving physical events than about immediately realizing every accepted interface, camera, material, history,
and presentation ideal. The cut remains under review. P10.8 closure is suspended until this audit is accepted or
amended. Terms follow the global [phasing framework](../PHASING-FRAMEWORK.md).

## Pre-alpha-critical foundation

“Critical” below means the narrow contract must exist. It does not require mature polish or every content family.

| Decision family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Shared play shell | Left tool rail, central SceneTray/BattleMat, right Gemini-DM conversation/composer; no structured inspector takeover of the DM rail | This is the game's basic human/DM/world relationship and protects the clean prose lane Adam chose. |
| Mechanical spatial truth | Exact cells, legal path/target/area/topology/current-state authority for the mechanics present in the slice | A beautiful approximate map cannot be the game board. |
| Renderer authority boundary | BattleMat, EngagementLens, audio, cards, and prose consume canonical receipts; none directly mutates mechanics | Retrofitting this after presentation scripts own state would force a rewrite and duplicate effects. |
| Representative physical event truth | Truthful fallback for movement, hit/damage/down, core condition, door/object state, topology change, hazard, destruction, and drop/custody | Adam's gating question is whether actual canonical events can be rendered on the board at all. |
| Stable identity and secrecy | Stable ids/speakable encounter labels; every projection obeys viewpoint knowledge and reveals no hidden slot/count/source | Labels and leaks become embedded in prose, saves, and player reasoning. |
| Mechanical activation order | Exact deterministic initiative/activation/reaction ownership, even if first UI is plain | Presentation may simplify; action legality and time cannot. |
| Validated interaction | Clicked objects expose only eligible validated actions and never mutate state directly | The object card can be simple, but it cannot become a second rules engine. |
| Durable consequence/recovery seam | Receipt/event ids, terminal state, idempotent recovery, and no mechanical replay after skip/load/crash | Fancy interrupted choreography may wait; duplicated damage and lost custody cannot. |
| Fictional consequence minimum | Gemini receives exact fact anchors; core receipt families have a viewpoint-safe natural-language fallback | The DM rail cannot block forever or dump `ward spent` when Gemini fails. |
| Honest visual fallback | Existing usable sprites/lighting/material citizenship is preserved; missing bespoke assets/effects fall back visibly and truthfully | Failure must look modest, not state something mechanically false or destroy the accepted visual identity. |

## Scaffold first -> feature goal

| Decision family | Pre-alpha form | Accepted feature goal | Seam retained now | Promotion trigger |
|---|---|---|---|---|
| Responsive shell | One supported desktop layout and conservative minimum viewport | Three proof viewports, tablet behavior, and robust rail/tray adaptation | Named layout regions and CSS/layout ownership boundaries | The desktop event corpus is green and the next player/device cohort is chosen. |
| Object-card placement | A safe fixed edge or simple left/right choice that never covers the target or critical action controls | Smart quadrant/occlusion placement with scroll/context preservation | One clicked-object inspector component with anchor/eligible-action inputs | Card obstruction or cursor travel is a measured playtest problem. |
| Route preview | One exact legal route with known material hazards and a conservative locked extension | Resource-aware safe route, material alternatives, richer interrupts, and bounded undo | Route candidate/result ids and explicit preview-versus-commit boundary | Route choice is confusing or tactically shallow with real hazards/resources. |
| Rooted callback labels | Encounter-stable numbered/type labels plus names the player actually learns | Monotonic cross-scope callbacks and remembered aliases | Stable entity id distinct from current display label | Longer returns make encounter-only handles ambiguous. |
| Receipt cue scheduling | Store the accepted dependency-bearing causal group, but initially execute it serially with typed truthful fallbacks | Legal sibling overlap, repetition compression, channel arbitration, and rich choreography | Receipt/presentation ids, hard dependencies, causal group, terminal obligation | Serial playback becomes slow after the representative corpus is correct. |
| Input during consequences | Gate consequential world commits during material cues; preserve composer draft and safe reading where cheap | Truth-complete decision boundaries, one pending intent, and fine-grained safe input | Explicit committed/uncommitted intent state and decision-boundary signal | Players frequently fight the gate or lose planning flow in corpus tests. |
| Interrupted presentation | Rebuild exact terminal board/card state and let Gemini/fallback recap missed known consequences | Semantic owed-obligation checkpoints, reduced-motion equivalents, and richer pending-state restoration | Canonical event cursor plus terminal/owed presentation records | Save/load/background tests show important consequences are not understood. |
| EngagementLens | Optional/off or one simple supported family; BattleMat remains sufficient for truth | Selected-PC active-follow, faction sides, expressive combat citizenship, and governed animation | Derived adapter keyed to canonical actors/receipts; no mechanics ownership | BattleMat truth is proven but combat lacks readable character drama. |
| Initiative presentation | Plain portrait/text row or compact ordered list | Winner-first faction blocks, smart crops, overflow, reinforcements, allegiance transfer animation | Stable activation entries and deterministic ordering separate from layout | Larger encounters are mechanically correct but hard to scan. |
| Physical props and materials | Cheap primitives/derived faces, a small truthful prop kit, and existing viable lighting/sprites | Routed materials, normals, shadows, realm skins, richer props, and the accepted hybrid beauty floor | Semantic surface/prop role and deterministic asset fallback | Native-resolution captures show readability is sound and material sameness is now the limiting defect. |
| Camera behavior | Current/gentle view, simple bounded auto-fit for truly offscreen material events, skip/recenter | Governed overview/room/action ladder and player-owned Option B focus leases | Typed focus request and policy adapter; terminal restore target | A-versus-B tests show automatic direction interrupts reading/typing or misses events. |
| Attention and accumulated-history UI | Store exact events/knowledge; project current truth on BattleMat, consequences in DM prose, and detail through clicked cards | Ambient -> noticed -> relevant -> active -> historical ladder, progressive holder-aware cards, causal remounting | Durable event/discovery ids, viewpoint knowledge, relevance/attention state as data rather than visual ownership | Comprehension tests fail despite truthful board state, prose, and invoked inspection. |
| Durable history lifecycle | Exact canonical history plus a short viewpoint-known recap/current card state | Coalescence, aging, bounded traces, remount envelopes, opportunity resilience, and expressive retelling | Append-only causal identity, current projection, viewpoint knowledge, retirement reason | Long sessions make exact history noisy or cause unresolved discoveries to disappear from play. |
| Consequence information layer | **No automatic brief in the first target**; use physical board truth, normal status/action surfaces, Gemini/fallback prose, and clicked inspection | Only the narrow structured aid evidence proves necessary; the rejected raw mechanical dump never becomes the goal | Shared receipt ids allow a later adapter without changing mechanics | BattleMat-plus-Gemini tests show a repeatable material comprehension failure other surfaces cannot repair. |
| Gemini clause breadth | Hand-authored/tested minimum clauses for the representative core event families | Broader variation, combination, localization, tone, and context-compacted recovery | Typed anchor schema and validated forward-only narration contract | New mechanics lack a natural truthful fallback or repeated phrasing becomes materially dry. |
| Property and custody projection | Current holder/location plus a visible state change and plain fictional account | Title, claims, licenses, disputed ownership, and holder-aware history surfaces | Exact unique-item identity/custody and separate attributed-ownership relation | The playable slice introduces theft, lending, claims, or contested ownership as core choices. |
| Visual proof corpus | A small deterministic corpus for the actual verbs above at gameplay scale | Multi-viewport beauty, materials, crowded cues, interruption, accessibility, and performance matrices | Reproducible scenarios and stable capture points | Each scaffold earns its richer acceptance gate; P10.10/P10.12 set budgets. |

## Recommended Wave 10 pre-alpha slice

Build one desktop vertical slice that can show a party moving through exact cells; opening, failing, breaking, and
changing an object; attacking and applying damage/down/one condition; changing a door or topology; revealing one
known hazard; dropping/transferring one unique object; and recovering the exact terminal state after interruption.
Gemini narrates committed fact anchors, with minimum fictional fallback clauses for those families. Presentation can
be serial, cards can place conservatively, initiative can be plain, camera movement can be minimal, and the
EngagementLens can be absent or narrowly enabled.

Only after that physical-event corpus works at gameplay scale should pre-alpha spend substantial time on rich
materials, smart card placement, parallel cue choreography, multi-step camera governance, progressive history UI,
or additional consequence information layers. Store the ids, receipts, dependencies, knowledge, and policy seams
those goals require from the beginning.

## Decisions that this audit changes operationally

- The mature dependency-aware scheduler remains the destination, but its first presenter may be serial.
- Fine-grained safe input/pending intent remains the destination, but a conservative world-action gate may ship
  first if drafts and non-destructive state are preserved.
- Rich semantic interruption catch-up remains the destination, but exact terminal rebuild plus a known-consequence
  recap is the first gate.
- Automatic focus Option A is only a starting scaffold; the typed focus seam and A-versus-B evidence remain
  mandatory, while elaborate directing does not precede physical event proof.
- The P10.7 attention/history direction remains the feature goal. Its canonical history and knowledge contracts are
  critical; its full ambient-to-historical visual projection is not.
- F10.8e's automatic consequence brief remains outside the first target and gains no automatic later entitlement.
  It reopens only from observed comprehension failure.

## P10.8 closure impact

F10.8g's earlier proof corpus described too much mature realization as one pre-alpha target. Do not answer that old
closure question as written. After Adam accepts or amends this audit, restate F10.8g as a phased closure: critical
seams and representative physical verbs first; named presentation goals later; P10.9 still mandatory immediately
after P10.8 closes.
