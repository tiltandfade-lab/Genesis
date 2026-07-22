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
   mechanics, renderer/EngagementLens, Gemini contract, persistence, and QA seams. It does not build an entire data
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

## Stage 1 - one small retained clay room

Use the existing deterministic 5x5 `clay-room` direction as the starting fixture unless later inspection proves it
cannot exercise the required production path. Keep authored fixture inputs small; route rendered geometry,
materials, lights, mechanics, and adapters through the same owners the game uses.

The room grows through retained named scenario variants and traces. A later pass may add the opponent, hazard, or
interruption point it needs, but it does not overwrite the earlier fixture/expected trace so the faster gate
disappears.

### C1A - room truth and projection

**Primary question:** can one canonical room compile and render with exact cells, walls, one portal, one interactive
object, stable ids, a playable tabletop visual floor, and no renderer-owned mechanics?

This pass proves the room/cell identity seam, semantic-to-spatial projection, stable capture, and BattleMat shell.
It does not require site simulation or a complete dungeon.

### C1B - local movement and route

**Primary question:** can the player move, choose a materially different route when one exists, and cross/use the
portal through exact preview-versus-commit receipts?

This pass proves exact cells, route agency, labels, portal use, and the preview-versus-commit boundary without also
making object interaction or combat part of its primary gate.

### C1C - object, hazard, and custody

**Primary question:** can the player inspect and act on the object, encounter one known hazard, change physical
state, and pick up or transfer one unique object through validated receipts?

This pass proves object-card authority, hazard/object state, custody, and Gemini fact anchors for noncombat actions.

### C1D - BattleMat/EngagementLens battle spine

**Primary question:** can BattleMat tactical truth and the mandatory EngagementLens perform one small duel without
duplicating or losing mechanics?

The lens appears for every material combat beat. Exact activation, movement, attack, hit/damage/down, target and
active-actor identity, generic truthful lens staging, and deterministic return to board truth are canonical and
visible. This is the first **battle-system** gate, not merely a renderer demo.

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

### C1G - DM consequence language

**Primary question:** can timely Gemini prose, latency, invalid anchors, and unavailability all communicate the same
viewpoint-legal committed consequence without blocking, duplication, raw engine language, or a dry second voice?

Use the clean DM rail, fact-locked Gemini prose, and several context-slotted minimum fictional clauses. This pass
consumes C1C-C1F receipts and recovery state; it does not create another consequence authority.

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

### C2B - promise and payoff

**Primary question:** can an early clue, obstruction, resource fact, or visible consequence create one stable
cross-room promise that later becomes relevant and pays off without invention or reminder clutter?

This proves the minimum promissory discovery, knowledge separation, callback identity, causal history, and
Gemini-led projection before building a discovery network or full attention ladder.

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

For the pre-alpha party premise, noncombat owns one main-PC/party anchor and a coarse companion formation rather than
invented exact companion coordinates. Combat derives a bounded deployment zone from the established location,
approach, and legal terrain. The one player-owned main PC and independently acting allies/sidekicks enter through
that zone and formation contract. Narrative-only companion wandering cannot change location, custody, or placement;
a validated detachment or other canonical event is required. For pre-alpha, the deterministic formation resolver
places the whole party, including the main PC, within the legal zone and persists one non-rerollable placement batch.
There is no initial deployment interaction. The mode change uses a simple orientation-preserving crossfade or
reframe plus one short fact-locked Gemini/fallback bridge; stable landmarks, citizens, damage, and objects carry
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
leaks, duplicated Gemini explanation, or interruption/recovery drift?

This promotes C2D's simple crossfade plus Gemini bridge into a reusable visual transition grammar. It adds camera,
timing, landmark hold, citizen/object settling, interruption, fallback, and cross-adapter visual QA over the same
SceneLineage handoff; it does not add a continuity summary or make animation canonical. The structured mechanical
information layer remains evidence-gated and is not an automatic later milestone.

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

### C4B - claims, custody, and invention

**Primary question:** can current possession, attributed ownership/claim, a discovered object/fact, and an approved
SceneFact promotion remain distinct and survive action, narration, and save/load?

### C4C - bounded crisis and DM obligation

**Primary question:** can one minimal CrisisChain fork/convergence coordinate existing actors, resources, hazards,
and ordinary actions while the DM's small obligation queue preserves a prior promise and retires it legally?

The crisis graph orchestrates existing owners; it does not become a second action economy or site simulator.

## Stage 5 / C5 - grow the retained portfolio

Only after C1-C4 work should Genesis deliberately grow toward Wave 2's accepted **twelve golden sites**, **eight
adversarial transition traces**, and deterministic/batch/human proof layers. Add sites incrementally in risk order,
not as a single content or engine batch. Each new site should justify itself by covering a dimension the current
corpus lacks: size, purpose, operating state, supply model, group conflict, scale, Spice, or non-institutional form.

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
