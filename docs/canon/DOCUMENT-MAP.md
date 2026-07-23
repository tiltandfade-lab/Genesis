---
type: canon
status: ACTIVE — the durable topic-to-source routing table + document census
created: 2026-07-22
owner: docs/canon/README.md (precedence law)
scope: every design-relevant markdown document in the repository
---

# Document Map — routing, census, and supersession

This file answers two questions no other document owns:

1. **"Where is the current ruling on topic X?"** — the routing table below points every major
   topic at its single canonical owner.
2. **"What is this old file, and does it still bind?"** — the census classifies every
   design-relevant document, and the supersession map records which documents replaced which.

Nothing here rewrites history. Historical, superseded, and research documents stay exactly where
they are and remain linkable; this map is how they stay **discoverable without competing as
current truth**. Census classifications are editorial routing metadata, not content changes; a
document's own text was not modified merely because it is classified here.

Classification vocabulary: `current-canon` · `accepted-supporting` · `implementation-evidence` ·
`proposed` · `superseded` · `historical` · `research` · `operations` · `archive` ·
`generated-report`.

## 1. Topic routing table

| Topic | Current canonical owner | Notes |
|---|---|---|
| Where is the current ruling? (any) | [canon front door](README.md) | one jump to everything below |
| Product identity, scope tiers, non-goals | [PRODUCT-SCOPE.md](PRODUCT-SCOPE.md) | proof ≠ MVP ≠ feature goal law lives here |
| Per-module proof/MVP/ideal horizons (whole game) | [MODULE-PHASING.md](MODULE-PHASING.md) | dungeon-program families → Feature-Promotion Ledger |
| Which system owns which facts | [SYSTEM-OWNERSHIP.md](SYSTEM-OWNERSHIP.md) | |
| Locked decisions (stable ids, all eras) | [DECISION-INDEX.md](DECISION-INDEX.md) | indexes `docs/DESIGN.md` blocks + wave closures |
| Questionnaire coverage (all 12 waves) | [QUESTION-COVERAGE.md](QUESTION-COVERAGE.md) | every P/G/F id → disposition |
| Genuinely open founder decisions | [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) | batches of ≤10 |
| Overloaded terms | [GLOSSARY.md](GLOSSARY.md) | |
| Dungeon-redesign program (waves, ladder, ledger) | `docs/PROCEDURAL-DUNGEON-DIRECTION.md` | remains the program front door; subsystem-scoped |
| Wave N accepted semantics | `docs/procedural-dungeon-direction/wave-0N/` | chronological wave records are the semantic authority |
| Proof→MVP→goal phasing law | `docs/procedural-dungeon-direction/PHASING-FRAMEWORK.md` | |
| Clay Pass ids (C1A…C5) | `docs/procedural-dungeon-direction/CLAY-PROOF-LADDER.md` | |
| Feature traceability (MVP obligation → goal → trigger) | `docs/procedural-dungeon-direction/FEATURE-PROMOTION-LEDGER.md` | |
| Pre-dungeon-era locked decisions (June 2026) | `docs/DESIGN.md` dated blocks | chronological registry; DECISION-INDEX carries the ids |
| Current implementation map (what code exists) | `docs/ARCHITECTURE.md` | implementation evidence, NOT design target |
| Session state / what happened / what's next | `docs/HANDOFF.md` · `docs/CHANGELOG.md` · `docs/NEXT-STEPS.md` | chronological operations surfaces |
| Graphics governing charter | `docs/GRAPHICS-CONVERGENCE-CHARTER.md` | protected core + convergence law |
| Is the Clayroom fixture trustworthy? (reset ladder CL-R0…CL-R6) | `docs/CLAYROOM-RESET-LADDER.md` | renderer/fixture-trust gate across passes; gates C1H/C1I/Guard Post 1 |
| Golden-site structure/material catalog + the Guard Post brief | `docs/GOLDEN-SITES-CATALOG.md` | FFT relational grammar, GP-SHAPE-01, cultural mutation MVP/Ideal, seed law, FFT/import boundary |
| Pixel sprite register (canon figure register) | `docs/ART-DEPARTMENT.md` | Adam's 2026-07-15 ruling; quote, never paraphrase |
| Faceted RESERVE register + prop/decal/kit contracts | `docs/ART-DIRECTION-CANON.md` | sibling scope to ART-DEPARTMENT, not a rival |
| DM persona/behavior | `docs/DM-CHARTER.md` | |
| DM↔engine event law | `docs/EVENT-CONTRACT.md` (+ generated `dm-contract.json`) | |
| Combat (current, built) | `docs/COMBAT.md` + `docs/BATTLEMAP.md` (12-zone) | exact-cell successor ACCEPTED, unbuilt — Wave 10 §11.6-11.7 |
| Combat (accepted future authority) | Wave 10 record + Wave 6/7 records | BattleMat exact cells + EngagementLens |
| Crit Magnitude (current, built) | `docs/CRIT-MAGNITUDE.md` | recalibrated design accepted in Wave 2 §10.11.28-50; doc/impl intentionally not yet amended |
| Crit Magnitude (accepted redesign) | wave-02 part 04 (§10.11.28-10.11.50) | 15/3/1/1 ladder, TerminalDisposition, Mythic/Worldbreaker |
| Tier scope (level 1-10 cap) | `docs/TIER-SCOPE.md` | |
| Tables discipline / edit-source→compile | `CLAUDE.md` + `docs/TABLE-EDIT-SAFETY.md` + `docs/TABLE-ROW-CONTRACT.md` | |

## 2. Census — docs/ (flat), A-G

- docs/ADAM-REVIEW-1.md — historical — review-notes/BINDING(2026-07-02) — absorbed into BATCH3-PLAN/SKIN-GRANTS
- docs/ADAM-REVIEW-2.md — historical — review-notes/BINDING(2026-07-03) — internal §3 supersession self-noted
- docs/ADVANCEMENT-RETUNE.md — proposed — system-spec/structure-locked(2026-07-01) — extends ADVANCEMENT.md; numbers await play telemetry
- docs/ADVANCEMENT.md — current-canon — system-spec/"draft"(2026-06-21) — ⚠ stale status: system BUILT to L10
- docs/ANATOMY-CANON.md — current-canon — system-spec/SEED(2026-07-08) — accuracy layer for model pipeline
- docs/ANIMAL-SOCIAL-HQ.md — implementation-evidence — fix-spec/SPECCED-then-LANDED(2026-07-09) — child of ANIMAL-SOCIAL
- docs/ANIMAL-SOCIAL.md — current-canon — system-spec/SPECCED-locked(2026-07-08) — built via HQ wave
- docs/ARCHITECTURE.md — current-canon (implementation map) — architecture/living(2026-07-05) — describes CURRENT code; predates dungeon program by design
- docs/ART-DEPARTMENT.md — current-canon — style-canon/LAW(2026-07-15) — pixel register home; sibling of ART-DIRECTION-CANON (scoped, not rival)
- docs/ART-DIRECTION-CANON.md — current-canon — style-canon/LAW(2026-07-14) — faceted RESERVE register master copy
- docs/ASSET-PROMPTS.md — operations — working-doc(2026-07-01) — image-gen shopping list; no frontmatter
- docs/ASSET-SOURCING-RESEARCH.md — research — research(2026-07-16) — license-safe source shortlist
- docs/ASSET-SYNC.md — operations — ops-note/ADOPTED(2026-07-09) — fetch-on-demand heavy assets
- docs/ATTRIBUTION.md — current-canon — attribution(2026-07-02) — CC-BY notices (forever-guard)
- docs/AUTOMATED-PLAYTEST.md — proposed — system-spec/PLANNED(2026-07-03) — Layer-1 AI-player loop
- docs/BATCH-GUARDRAILS.md — historical — build-guardrails(2026-07-01) — band-share law partially superseded by SPICE-RAISE
- docs/BATCH2-GUARDRAILS.md — historical — build-guardrails(2026-07-01) — partial supersession by SPICE-RAISE
- docs/BATCH3-GUARDRAILS.md — historical — build-guardrails(2026-07-02) — partial supersession by SPICE-RAISE/SPICE-RULER
- docs/BATCH3-PLAN.md — historical — build-plan(2026-07-02) — plan + after-action mix
- docs/BATTLE-THEATER.md — accepted-supporting — system-spec/SPECCED-RULED(2026-07-03) — theater now feature-flagged laboratory per Wave 10
- docs/BATTLE-VISUALS.md — historical — system-spec(2026-07-03) — §C superseded by BATTLE-THEATER (self-noted)
- docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md — accepted-supporting — design-study/ACCEPTED-DIRECTION(2026-07-22) — C1H proof owner; no build authorized
- docs/BATTLEMAP.md — current-canon (built system) — system-spec/BUILT-LEGACY(2026-07-01) — 12-zone live; exact-cell supersession accepted-not-built (self-noted)
- docs/BEAUTY-WAVE.md — historical — system-spec/SPECCED(2026-07-10) — VP0-VP8; inline frontmatter
- docs/BEAUTY-WAVE-2.md — historical — system-spec/SPECCED(2026-07-10) — mock convergence
- docs/BEAUTY-WAVE-3.md — historical — system-spec/SPECCED(2026-07-11) — integration pass
- docs/BEAUTY-WAVE-4.md — historical — system-spec/SPECCED(2026-07-11) — motion & feel
- docs/BEAUTY-WAVE-4B.md — implementation-evidence — system-spec(2026-07-11) — hit-stop ledger wire
- docs/BEAUTY-WAVE-5.md — historical/proposed — system-spec/SPECCED-v2(2026-07-11) — second integration pass; v1 self-superseded
- docs/BESTIARY-COVERAGE.md — historical — system-spec/SPECCED(2026-07-04) — model program (since re-scoped by sprite transition)
- docs/BESTIARY-DASHBOARD.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — depends on BESTIARY-MANUAL S2
- docs/BESTIARY-MANUAL.md — current-canon — system-spec/SPECCED(2026-07-05) — reference-app spec
- docs/BLENDER-MODEL-SPEC.md — current-canon — system-spec/LOCKED(2026-07-08) — external Blender pipeline contract (lane parked)
- docs/BLOCKWRIGHT.md — superseded — system-spec(2026-07-01) — ⚠ stale self-presentation; pivot recorded only in siblings (BATTLE-THEATER/BATTLE-VISUALS)
- docs/BREACH.md — current-canon — system-spec/specced(2026-07-02) — breach/nightmare skin; Fray/Spice authority consumed by Wave 10 travel rulings
- docs/CAMEO-CAST.md — proposed — system-spec/awaiting-review(2026-07-08)
- docs/CHANGELOG-ARCHIVE.md — archive — changelog-archive(2026-07-09) — read-only overflow
- docs/CHANGELOG.md — operations — none — dated chronological record, newest 25
- docs/CHAR-CREATION.md — current-canon — design-doc/living(2026-06-18)
- docs/CHASE-BITE.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06)
- docs/CHASE-CONTRACT-FIX.md — implementation-evidence — system-spec/SPECCED(2026-07-04)
- docs/CHASE-SOFT-RECALL.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/CHROME-REKEY.md — historical — design-note(2026-07-08) — ⚠ header "DRAFT awaiting taste pass" vs in-doc "RESOLVED — Adam's rulings 07-08 night"
- docs/CLAYROOM-RESET-LADDER.md — current-canon — system-spec/CL-R0-BUILT-rest-SPECCED(2026-07-23) — the Clayroom reset/proof ladder's single owning spec; subordinate to CLAY-PROOF-LADDER (C1A…C5 ids stay there)
- docs/CODEX.md — current-canon — system-spec/phases-1-5-built(2026-06-24)
- docs/COMBAT-LIFECYCLE.md — current-canon — system-spec/built(2026-07-03)
- docs/COMBAT-TRACKER.md — current-canon — system-spec/built(2026-07-01)
- docs/COMBAT.md — current-canon — system-spec/built(2026-06-21→07-03) — future exact-cell authority accepted in Wave 10 (unbuilt)
- docs/COMPANIONS.md — proposed — system-spec/build-ready-except-sidekick-data(2026-07-01)
- docs/CONSEQUENCE-LADDER.md — proposed — system-spec/specced-draft(2026-06-29)
- docs/CORPUS-INTENSITY-MAP.md — generated-report — generated-map — regenerate after table edits
- docs/COSMIC-REKEY.md — historical — design-note(2026-07-08) — ⚠ same DRAFT-vs-RESOLVED header pattern as CHROME-REKEY
- docs/CRAFT-PASS-RUNBOOK.md — operations — runbook(2026-07-07)
- docs/CRAFT-SHELF.md — operations — craft-notes/shelf(2026-07-08) — parking for ruled rows; prune discipline unverified
- docs/CREATURE-MODELS-P2.md — proposed — system-spec/SPECCED(2026-07-04) — re-scoped by sprite transition
- docs/CRIT-MAGNITUDE.md — current-canon (built system) — system-spec/locked(2026-06-23) — ⚠ Wave 2 recalibration (15/3/1/1, TerminalDisposition) accepted at design level; doc/impl amendment deliberately pending — Wave 2 record is design authority
- docs/CROWNING-BASTION.md — proposed — design-proposal/RULED(2026-07-07) — builds queued behind TRANSITION-CONTRACT + ITEM-LEGACY
- docs/DEATH-AND-REBIRTH.md — current-canon — system-spec/"draft"(2026-06-21) — ⚠ stale status: all seven build steps landed
- docs/DECK-CLEARING-FINDINGS.md — research — working-note/awaiting-review(2026-06-28) — corrects REAUTHORING-SWEEP-PLAN merges
- docs/DESIGN-GUIDE.md — current-canon — design-guide/v1(2026-07-01) — pillars + Ivalice bible + T0-T7; visual sections now read through Wave 10/GCC routing (see §4)
- docs/DESIGN-REVIEW-2026-07-15.md — proposed — design-review/OPEN(2026-07-15) — ⚠ open gate; verify whether the "design meeting" resolved elsewhere (dungeon waves largely absorbed it)
- docs/DESIGN.md — current-canon — design-doc/living/canonical(2026-06-17→07-22) — the locked-decision registry (chronological blocks)
- docs/DETECTED-EVENTS.md — implementation-evidence — system-spec/SPEC-LOCKED(2026-07-06) — BUILT 2026-07-07 per CLAUDE.md/index — ⚠ status never flipped
- docs/DEV-PORTAL.md — proposed — system-spec/SPECCED(2026-07-18)
- docs/DICE-OVERLAY.md — current-canon — system-spec/BUILT(2026-07-01)
- docs/DIEGETIC-LIGHT.md — proposed — system-spec/SPECCED(2026-07-11)
- docs/DIFFICULTY.md — current-canon — system-spec/"draft"(2026-06-21) — ⚠ stale status: foundational, heavily depended-upon
- docs/DIGEST-DIET.md — current-canon — system-spec/specced-build-first(2026-07-01) — roster-line shape consumed by Wave 6 G6.1 budgets
- docs/DIRECTION.md — historical (standing claims superseded) — direction/"STANDING"(2026-07-03) — ⚠ claims to supersede NEXT-STEPS ordering; its playability-gate/moratorium/freeze framing predates and is overtaken by the July graphics-convergence + dungeon-wave programs; routing banner added this pass
- docs/DM-BRIDGE.md — current-canon — system-spec/implemented-v1(2026-06-21)
- docs/DM-CHARTER.md — current-canon — system-spec/living(2026-06-22) — the narrator constitution
- docs/DM-CONTRACT-ARTIFACT.md — implementation-evidence — system-spec/SPEC-LOCKED(2026-07-06) — ⚠ artifact live (regenerated by orchestrations) despite "deferred" label
- docs/DM-SEAT.md — current-canon — system-spec/SPECCED(2026-07-03) — provider-neutral seat law (Wave 10 §11.83) now governs the product boundary
- docs/DM-TURN-WALKTHROUGH.md — research — exhibit/DRAFT — ⚠ self-flagged verify-before-public-use items
- docs/DREAM-HORIZON.md — current-canon — vision(2026-07-02) — bearing, not build queue; TEXT-FIRST/BLIND-PLAYABLE doctrines restated
- docs/DRESSING-ATMOSPHERE.md — implementation-evidence — system-spec(2026-07-04) — ⚠ status SPECCED but landed same day
- docs/DRESSING-WIRING.md — current-canon — system-spec/BUILT(2026-07-04)
- docs/DUNGEON-GRAPH.md — current-canon (built system) — system-spec/BUILT(2026-07-10) — future connection/secret/vertical authority = wave-04 record (self-noted 2026-07-22); resident-scaled wording constrained by P3.4/P6.4
- docs/DURABILITY-TRIO.md — current-canon — system-spec/specced(2026-07-01)
- docs/ECONOMY-SINKS.md — proposed — system-spec/specced(2026-07-01) — valuables table PROVISIONAL
- docs/ECONOMY.md — current-canon — system-spec/built(2026-07-01)
- docs/ENV-EXTERIOR-WAVE.md — proposed — system-spec/SPECCED(2026-07-14)
- docs/ENV-WAVES.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/EVENT-CONTRACT.md — current-canon — system-spec/"draft"(2026-06-21) — ⚠ stale status: the spine of advancement/difficulty/combat
- docs/EXTRUDED-SPRITE-PROP-LIBRARY.md — proposed — build-plan/ES-0-1-in-progress(2026-07-12) — authority = GRAPHICS-ENGINE §H
- docs/FABLE-DEV-TOOLS.md — proposed — rough-spec(2026-07-06) — do not build until re-gated; Wave 11 will own the workbench question
- docs/FABLE-WINDOW-2026-07-06.md — archive — session-runbook/expired(2026-07-06) — ⚠ self-mandated deletion/archival never performed
- docs/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md — current-canon — execution-plan — deep authority per ART-DIRECTION-CANON
- docs/FACETED-SHEET-TEMPLATE.md — operations — faceted-batch-template/fireable(2026-07-14)
- docs/FACETED-SPRITE-ART-MIGRATION.md — current-canon — graphics-plan/SPECCED(2026-07-12)
- docs/FLOOR-TEXTURES.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/FOREVER-STORAGE.md — current-canon — system-spec/specced-protection-class(2026-07-02) — Wave 6/12 structural-persistence direction extends (not replaces) this
- docs/FRAME-FIELD.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — whole-doc provisional (delegated design)
- docs/GAP-ANALYSIS.md — historical — design-doc/draft(2026-06-17) — punch-list superseded by later built systems; no supersession note in-file
- docs/GENERICIZATION-SCAN.md — historical — genericization-scan(2026-06-18) — IP-scrub record
- docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md — proposed — system-spec/SPECCED(2026-07-12)
- docs/GEOMETRY-OSS-INTEGRATION.md — proposed — system-spec/SPECCED(2026-07-12) — landed pieces tracked in CHANGELOG (geometry default flip)
- docs/GIT-LFS-MIGRATION.md — operations (done) — runbook/"READY"(2026-07-10) — ⚠ stale: LFS live since 2026-07-18 per DESIGN.md infra note
- docs/GOLDEN-SITES-CATALOG.md — accepted-supporting — design-study/ACCEPTED-DIRECTION-implementation-unauthorized(2026-07-23) — golden-site kit catalog + Guard Post brief; Desktop packet folded, routes detail to composition/trim/material owners
- docs/GLOOM-KEY.md — current-canon — system-spec/SPEC-locked-throughline(2026-07-08)
- docs/GRAPHICS-CONVERGENCE-CHARTER.md — current-canon — design-guide/ACTIVE(2026-07-12) — governing graphics authority
- docs/GRAPHICS-CONVERGENCE-PLAN.md — current-canon — orchestration-plan/ACTIVE(2026-07-12) — governed_by charter
- docs/GRAPHICS-ENGINE.md — current-canon — system-spec/"PROVISIONAL"(inline) — ⚠ §H treated as normative by consumers; status label lags authority
- docs/GRAPHICS-NORTH-STAR.md — current-canon — system-spec/SPECCED(2026-07-11) — adopts VQ-frames handoff as north star
- docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md — proposed — system-spec/SPECCED(2026-07-12)
- docs/GUISE.md — proposed — system-spec/SPEC-universal-scope(2026-07-10) — Wave 6 P6.8 transformation law is the accepted design-level owner

## 3. Census — docs/ (flat), H-P

- docs/HANDOFF.md — operations — session-handoff(updated 2026-07-22) — chronological; ≤3 entries by standing rule
- docs/HOOK-WALKS.md — proposed — system-spec/awaiting-review(2026-07-08) — ⚠ in-doc RESOLVED section vs header
- docs/HOTFIX-QUEUE-2026-07-06.md — historical — system-spec/"deferred"(2026-07-06) — ⚠ landed 07-07 per HANDOFF; status never flipped
- docs/HOTFIX-QUEUE-2026-07-07-MARATHON.md — implementation-evidence — build-queue/BUILT(2026-07-07) — HQ3 index, all 16 landed
- docs/HOTFIX-QUEUE-2026-07-07.md — historical — system-spec/"SPEC-LOCKED"(2026-07-07) — ⚠ all 22 findings closed same day
- docs/HQ3-A-ECONOMY-KIT.md — historical — system-spec/"not built"(2026-07-07) — ⚠ landed per MARATHON index
- docs/HQ3-B-COMBAT-SEAM-TRIAGE.md — historical — build-spec/"no code yet"(2026-07-07) — ⚠ landed
- docs/HQ3-C-REST-CONCENTRATION.md — historical — system-spec/"not built"(2026-07-07) — ⚠ landed
- docs/HQ3-D-STATE-CODEX-HARNESS.md — historical — system-spec/"no code yet"(2026-07-07) — ⚠ landed
- docs/IN-SESSION-UI.md — current-canon (built shell) — system-spec/specced(2026-07-01) — carries explicit Wave-10 design-supersession notice (future shell = §11.2 target)
- docs/INITIATIVE-UI.md — current-canon — system-spec/SPECCED(2026-07-04) — future initiative-ribbon authority = Wave 10 F10.3l-t
- docs/ITEM-LEGACY.md — historical — system-spec/"deferred"(2026-07-06) — ⚠ landed in wave2a 07-07
- docs/ITEMS.md — current-canon — system-spec/built(2026-06-30)
- docs/JOB-WALKS.md — current-canon — system-spec/specced(2026-07-02) — ⚠ live code (jobWalkAccept) proves built
- docs/KENNEY-MESH-AUDIT.md — operations — build-plan/"IN PROGRESS"(2026-07-12) — ⚠ consumed as finished by KENNEY-SOCKET-WAVE
- docs/KENNEY-SOCKET-WAVE.md — proposed — system-spec/SPECCED(2026-07-15) — KS-1/2/3/3b landed 07-16 per NEXT-STEPS
- docs/LEVELUP-PICKER.md — proposed — system-spec/build-ready(2026-07-01) — queued fast-follow (TIER-SCOPE)
- docs/LIGHT-SIGHT-POLISH.md — proposed — system-spec/SPECCED(2026-07-11)
- docs/LOOSE-ENDS-070126.md — proposed — system-spec/specced(2026-07-01)
- docs/LOOT-REMAP.md — current-canon — loot-overhaul-spec(2026-06-18) — L4/L3b deferred per TIER-SCOPE
- docs/LOST-WORLD-REKEY.md — proposed — design-note/DRAFT(2026-07-08) — ⚠ in-doc RESOLVED section vs header
- docs/MATERIAL-IDENTITY.md — proposed — system-spec/SPECCED-WITH-SPIKE(2026-07-11) — clean 07-20 not-implemented clarification (Wave 10 evidence)
- docs/MICRO-PROPS.md — superseded — system-spec(2026-07-04) — partially superseded by BEAUTY-WAVE-5 (self-noted)
- docs/MODEL-BLITZ-24H.md — operations — runbook/LOCKED(2026-07-08)
- docs/MODEL-FOUNDRY.md — current-canon — system-spec/RE-SCOPED(2026-07-09) — ⚠ title says "every bestiary model"; scope now trays/props/architecture (creatures → sprites)
- docs/MODEL-GRAMMAR.md — superseded — system-spec/SPECCED(2026-07-03) — production method moved to whole-object + foundry; no in-file supersession note
- docs/MODEL-LANE-TRIAGE.md — research — system-spec/TRIAGE(2026-07-08)
- docs/MODELING-PIPELINE.md — current-canon — system-spec/LOCKED(2026-07-08) — (lane largely parked by sprite transition)
- docs/MONSTER-FLAVOR-TABLES.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/MONSTER-PARLEY.md — proposed — system-spec/SPECCED(2026-07-05)
- docs/MONSTER-STORY-WIRING.md — proposed — system-spec/SPECCED(2026-07-04) — overlaps pending WANT-HOOK ruling (self-noted)
- docs/MONSTER-TACTICS.md — proposed — system-spec/build-ready(2026-07-01)
- docs/NEW-GAME-FLOW.md — current-canon — design-spec/signed-off(2026-06-19)
- docs/NEXT-STEPS-ARCHIVE.md — archive — next-steps-archive(2026-07-09)
- docs/NEXT-STEPS.md — operations — next-steps/living(updated 2026-07-22)
- docs/NPC-COHERENCE-DIAL.md — current-canon (built) — system-spec/"AWAITING BUILD"(2026-07-08) — ⚠ merged per NPC-COHERENCE-FIXES; dead links [[project-genesis-codex]], moved GPT advice file
- docs/NPC-COHERENCE-FIXES.md — current-canon — system-spec/BUILT(2026-07-08)
- docs/NPC-KNOWLEDGE-GRADES.md — proposed — system-spec/SPECCED(2026-07-05)
- docs/NPC-PARTIALS.md — proposed — system-spec/SPEC(2026-07-08) — animal-citizen stack later consumed by Wave 10 transport ruling
- docs/NPC-PRESENCE-AND-HOOKS.md — proposed — system-spec/"AWAITING BUILD"(2026-07-08) — ⚠ component 1 already merged; dead link [[project-genesis-codex]]
- docs/NPC-ROLE-REALMS.md — current-canon (built) — system-spec/"wiring pending"(2026-07-08) — ⚠ merged per NPC-COHERENCE-FIXES; dead link docs/table-registry.md (real: repo root)
- docs/OFFLINE-ART-FOUNDRY-RESEARCH.md — research — research/COMPLETE(2026-07-12) — ⚠ "waves not started" stale vs KENNEY docs
- docs/ON-DEMAND-GEN.md — current-canon — system-spec/specced(2026-07-01)
- docs/OUTLANDISH-REALMS.md — current-canon — system-spec/BUILT-PROVISIONAL(2026-07-03)
- docs/OVERNIGHT-REPORT-2026-07-08.md — implementation-evidence — report(2026-07-08)
- docs/OVERNIGHT-TABLETOP-2026-07-07.md — historical — runbook/"ACTIVE"(2026-07-07) — ⚠ run concluded; never flipped
- docs/P1-WIRING.md — proposed — system-spec/SPECCED(2026-07-04) — ⚠ roster treated as shipped by later docs
- docs/PACING-DIALS.md — proposed — design-note/SPECCED(2026-07-05)
- docs/PARKING.md — operations — parking/STANDING(2026-07-02)
- docs/PHASE-3-AGX-SPEC.md — proposed — system-spec/SPECCED(2026-07-14)
- docs/PHASE-3-DIRECTOR-BRIEF.md — superseded — orchestration-plan/"awaiting direction"(2026-07-13) — ⚠ superseded same day by PHASE-3-WAVE-PLAN
- docs/PHASE-3-WAVE-1-SPECS.md — proposed — system-spec/SPECCED(2026-07-13)
- docs/PHASE-3-WAVE-2-SPECS.md — proposed — system-spec/SPECCED-GATED(2026-07-14)
- docs/PHASE-3-WAVE-PLAN.md — current-canon — orchestration-plan/ACTIVE(2026-07-13) — supersedes director brief
- docs/PLACE-ASSET-QUEUE.md — proposed — build-queue/PROVISIONAL(2026-07-09)
- docs/PLACE-GATHER-DMG14-DUNGEONS.md — research — reference/gathered(2026-07-09) — feeds PLACE-GEN
- docs/PLACE-GATHER-DMG14-SETTLEMENTS.md — research — reference/gathered(2026-07-09)
- docs/PLACE-GATHER-DMG24-BASTIONS.md — research — reference/gathered(2026-07-09)
- docs/PLACE-GATHER-DMG24-SETTLEMENTS.md — research — reference/gathered(2026-07-09)
- docs/PLACE-GEN.md — proposed (partially built) — system-spec/awaiting-review(2026-07-08) — ⚠ binding 07-09 addendum in-doc; 11 units MERGED per memory/CHANGELOG
- docs/PLAY-LENS.md — current-canon — system-spec/SPECCED(2026-07-14) — ⚠ Wave L COMPLETE per NEXT-STEPS-ARCHIVE
- docs/PLAYTEST-BUGS.md — operations — reference/living(2026-07-05) — ⚠ 17 days stale; not reconciled vs HQ2/HQ3 fixes
- docs/PLAYTEST-FINDINGS-0704.md — historical — report(2026-07-04)
- docs/POLISH-WAVE-1.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/POSITIONING.md — operations — none — career/pitch doc; no frontmatter
- docs/PRE-PLAYTEST-GAUNTLET.md — proposed — system-spec/SPECCED(2026-07-02) — ⚠ execution state unrecorded in-doc (gauntlet reports exist in dev/)
- docs/PREP-AUTOPILOT.md — proposed — system-spec/build-ready(2026-07-01)
- docs/PROBE-PROMPTS.md — proposed — asset-session/ready(2026-07-01) — completion unrecorded
- docs/PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md — superseded — design-study/DISCOVERY(2026-07-19) — self-flagged: wave-04 owns its topics
- docs/PROCEDURAL-DUNGEON-DIRECTION.md — current-canon — design-study/DISCOVERY(2026-07-18→22) — program front door (subsystem-scoped; whole-game front door = docs/canon/)
- docs/PROCEDURAL-DUNGEON-ENGINE-CROSSWALK.md — research — research/AUDITED(2026-07-18)
- docs/PROCEDURAL-DUNGEON-RESEARCH.md — research — research/COMPLETE(2026-07-18)
- docs/PROP-NOUN-LIBRARY.md — research — reference/working(2026-07-08)

## 4. Census — docs/ (flat), Q-Z

- docs/RANK-SMITH.md — proposed — system-spec/CONTENT-STUB(2026-07-03) — self-flagged not wired
- docs/README.md — current-canon — docs-index(2026-06-21) — the docs folder index; now routes into docs/canon/ (this pass)
- docs/REALM-BESTIARY-DRAFT.md — accepted-supporting — none — compiled source of truth = dev/model-qa/realm-bestiary-draft.json; ⚠ 1092 count stale vs 1307
- docs/REALM-BESTIARY-ICONS.md — accepted-supporting — none — folded into draft JSON; nothing marks it consumed
- docs/REALM-BESTIARY-SCAN.md — superseded — none — duplicate of DRAFT in gloss form; orphaned
- docs/REALM-ENRICHMENT-WRITING.md — proposed — system-spec/SPECCED(2026-07-04) — ⚠ desc/traits fields exist per later docs; status never flipped
- docs/REALM-HOOKS.md — proposed — system-spec/awaiting-review(2026-07-09) — ⚠ README already lists it as "current, re-keyed"
- docs/REALM-KEY-EXPANSION-ROSTER.md — accepted-supporting — craft-draft/APPROVED-concepts/canonical:false(2026-07-09)
- docs/REALM-KEY-EXPANSION-STATS-SPEC.md — proposed — build-spec/SPEC-LOCKED/canonical:true(2026-07-09) — verify wave landing
- docs/REALM-MODEL-PLAN.md — superseded (creature scope) — system-spec/PLAN(2026-07-08) — ⚠ SPRITE-TRANSITION (07-09, LOCKED) reroutes creatures to sprites; never marked
- docs/REALM-MODELS-P3.md — superseded (creature scope) — system-spec/SPECCED(2026-07-04) — ⚠ same sprite-transition collision
- docs/REALM-PLOT-ITEMS-PARKED.md — archive — parking-lot(2026-07-03)
- docs/REALM-PROPS-DRAFT.md — accepted-supporting — none — "for approval" never resolved in-doc
- docs/REALM-PROPS-WIRING.md — proposed — system-spec/SPECCED(2026-07-04) — §5.2 PROVISIONAL
- docs/REALM-RENDER-STYLE.md — proposed — design-proposal/awaiting-ruling(2026-07-04) — largely absorbed by per-realm finish rulings (SPRITE-GEN-V2/ART-DEPARTMENT); route there
- docs/REALM-ROLE-EDGES.md — proposed — reference/DRAFT-partial(2026-07-08) — 8/11 realms pending
- docs/REALM-STORY-WIRING.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/REALM-SURFACES-DRAFT.md — accepted-supporting — none — consumer BUILT; draft header stale
- docs/REALM-SURFACES-WIRING.md — current-canon — system-spec/BUILT(2026-07-04→08)
- docs/REALM-TRAITS-APPLY.md — proposed — system-spec/SPECCED-queued(2026-07-04)
- docs/REALM-WALK-WIRING.md — proposed — system-spec/SPECCED(2026-07-04)
- docs/REALM-WIRING.md — current-canon (built) — system-spec/"SPECCED"(2026-07-04) — ⚠ later docs treat machinery as live
- docs/REAUTHORING-RUBRIC.md — current-canon — rubric/working-standard(2026-06-28)
- docs/REAUTHORING-SWEEP-PLAN.md — proposed — build-plan/ready(2026-06-28) — supersedes TABLE-REAUTHORING-PREP §3
- docs/REFERENCE-SHELF.md — current-canon (framework landed) — system-spec/"for review"(2026-07-05) — ⚠ TABLE-ATLAS built as "app #3"
- docs/REGIONS-NAMES.md — proposed — system-spec/specced(2026-07-01) — §4-5 await review (07-01 cohort)
- docs/RELEASE-CHANNEL.md — current-canon — system-spec/implemented-v1(2026-07-03)
- docs/REPUTATION.md — proposed — system-spec/build-ready(2026-07-01)
- docs/REVIEW-FIXES-0705-VISUAL.md — historical — fix-spec/SPECCED(2026-07-05) — verify execution vs CHANGELOG
- docs/REVIEW-FIXES-0705.md — historical — fix-spec/SPECCED-RULED(2026-07-05)
- docs/RISK-REGISTER.md — operations — risk-register/STANDING(2026-07-02) — ⚠ re-score trigger elapsed
- docs/ROLL-BRANCHES.md — proposed — system-spec/build-ready(2026-07-01)
- docs/ROOM-GRAMMAR.md — superseded — system-spec/PROMOTED-into-BW5-IA-3(2026-07-11) — clean pointer
- docs/ROOM-SHELL-COMPILER.md — proposed — system-spec/SPECCED(2026-07-11) — semantic authority ceded to wave-04 (07-22 note)
- docs/SCALING.md — research — none(2026-06-20) — architecture audit; migrate-when answer
- docs/SCENE-RISK-CONTRACT.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — post-Fable cohort
- docs/SEAT-ADAPTER.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — ⚠ HANDOFF wave2a suggests landed; reconcile
- docs/SEAT-PROMPT.md — proposed — seat-artifact/DRAFT-v1(2026-07-06) — ⚠ NOT on DM-SEAT fetch path (live gap)
- docs/SESSION-PREP.md — current-canon (design) — system-spec/draft(2026-06-23) — walk-roller build items open
- docs/SHIP-RULES-GATHER.md — research — reference/gathered(2026-07-08)
- docs/SHIP-TRAVEL.md — proposed — system-spec/awaiting-review(2026-07-08) — ⚠ in-doc RESOLVED section vs header
- docs/SHOP-UI.md — current-canon — system-spec/BUILT(2026-07-01)
- docs/SKIN-GRANTS.md — current-canon — system-spec/BUILT(2026-07-02)
- docs/SOCIAL-SPINE-FIXES.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — supersedes FABLE-WINDOW S1/S2/S3/S5
- docs/SOCIAL.md — current-canon (built) — system-spec/"draft"(2026-06-28) — ⚠ resolvers live per SOCIAL-SPINE-FIXES
- docs/SPATIAL-MODEL.md — current-canon — design-doc/canonical(2026-06-19)
- docs/SPECULATIVE-PREFETCH.md — proposed — system-spec/draft(2026-06-30)
- docs/SPEED-DOCTRINE.md — current-canon — doctrine/locked-BINDING(2026-07-02)
- docs/SPICE-CURVE.md — current-canon (vocabulary) — none — §1 distribution superseded by SPICE-RAISE (mutually noted)
- docs/SPICE-RAISE.md — accepted-supporting — system-spec/SPEC-LOCKED(2026-07-06) — adopted stance; §10 = drift-risk registry of old-distribution sites
- docs/SPICE-RULER.md — proposed — doctrine/DRAFT-for-blessing(2026-07-02) — ⚠ 20 days unresolved
- docs/SPRITE-BILLBOARD-RESEARCH.md — research — none(2026-07-16)
- docs/SPRITE-GEN-V2.md — current-canon (ruled sections) — none — §10 regen block awaits Adam confirm (memory-tracked)
- docs/SPRITE-IMPLEMENTATION-STRATEGY.md — implementation-evidence — system-spec/LANDED(2026-07-12)
- docs/SPRITE-SHEETS.md — current-canon — system-spec/UN-PARKED(2026-07-09)
- docs/SPRITE-TAGS.md — current-canon — none(2026-07-10) — open items section remains
- docs/SPRITE-TRANSITION.md — current-canon — system-spec/LOCKED/canonical:true(2026-07-09) — creatures→sprites; re-scopes MODEL-FOUNDRY
- docs/SRD-MECHANIZATION.md — current-canon — system-spec/built(2026-07-01)
- docs/STAGE-A.md — current-canon — BUILT-CLOSED(2026-07-12)
- docs/STAGE-C-ART-DIRECTION-REVIEW.md — implementation-evidence — graphics-review/ACTIONABLE(2026-07-12) — partial supersession by WALL-VOLUMES-PRACTICALS (mutual)
- docs/STAGE-C.md — current-canon — BUILT(2026-07-12)
- docs/STAGE-C4.1c-FLOOR-CONGRUENCE.md — proposed — system-spec/SPECCED(2026-07-12)
- docs/STAGE-D-WAVE-SPECS.md — proposed — system-spec/SPECCED(2026-07-14) — subordinate to BW5 laws + charter
- docs/STAGE-G3-WALL-RUNS.md — proposed — system-spec/SPECCED(2026-07-13) — supersedes code baseline (clean)
- docs/STARTING-STATE-MODELS.md — research — design-research/reference(2026-06-19)
- docs/STATE-HYGIENE-EVAL.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — post-Fable cohort
- docs/STYLE-PROBES.md — historical — system-spec/specced(2026-07-01) — outcome settled by later art canon; no in-doc closure
- docs/SYNTHESIS-CONTRACT.md — proposed — system-spec/draft(2026-06-23)
- docs/TABLE-ATLAS.md — current-canon — system-spec/BUILT(2026-07-07) — documents own freeze escape
- docs/TABLE-EDIT-SAFETY.md — current-canon — system-spec/locked(2026-07-03)
- docs/TABLE-GAPS-070126.md — proposed — system-spec/specced(2026-07-01) — §6 review gate open (07-01 cohort)
- docs/TABLE-REAUTHORING-PREP.md — superseded (§3 only) — working-note(2026-06-28) — rest still valid prep material
- docs/TABLE-ROW-CONTRACT.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — post-Fable cohort
- docs/TABLE-USAGE-AUDIT.md — generated-report — none — regenerate via build/gen-table-usage-audit.py
- docs/TABLETOP-UNITS.md — historical (largely executed) — build-spec/SPEC-LOCKED(2026-07-07) — U1-U4+U6 landed overnight 07-08; U5/U7 parked
- docs/TABLETOP-VISION.md — accepted-supporting (sequence superseded) — system-spec/SPECCED(2026-07-07) — ⚠ visual destination now = Wave 10 BattleMat/EngagementLens family; V-map/tray grammar remain evidence + taste inputs
- docs/TAG-VOCABULARY.md — current-canon — registry/canon(2026-07-08)
- docs/TAROT-2.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — successor to TAROT-SESSION (schema layer; one-directional)
- docs/TAROT-SESSION.md — accepted-supporting — system-spec/specced(2026-07-01) — canonical for DRAW/vector/roller-hook
- docs/THEATER-NEXT.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — overlaps later-built STAGE waves; reconcile at build
- docs/TIER-SCOPE.md — current-canon — system-spec/locked(2026-06-26)
- docs/TIYL-DEEPENING.md — proposed — system-spec/build-ready(2026-07-01)
- docs/TIYL-UI-PORT.md — proposed — system-spec/SPECCED(2026-07-03) — possibly absorbed by UI-VISION-QUEST
- docs/TIYL-WEIGHTED-STARTS.md — proposed — system-spec/awaiting-review(2026-07-08) — ⚠ in-doc RESOLVED section vs header
- docs/TRANSITION-CONTRACT.md — proposed — system-spec/SPEC-LOCKED-deferred(2026-07-06) — post-Fable cohort
- docs/TRAVEL-WALKS.md — proposed — system-spec/build-ready(2026-07-01) — future travel authority = Wave 10 F10.9g (TravelWalk contract)
- docs/TRIM-SHEET-PIPELINE.md — accepted-supporting — design-study/ACCEPTED-DIRECTION(2026-07-22) — C1I proof owner; no build authorized
- docs/UI-VISION-QUEST.md — implementation-evidence — design-spec/executing(2026-07-11) — verify completion vs CHANGELOG
- docs/UNIFICATION-WAVE.md — proposed — system-spec/SPECCED(2026-07-10) — ⚠ "art direction is CLOSED" claim contradicted by later activity
- docs/UNIT-STANDARDIZATION-REPORT.md — generated-report — none — snapshot only
- docs/URBAN-FABRIC.md — proposed — system-spec/specced(2026-07-02) — future town authority = Wave 10 F10.9h district-graph law
- docs/VISUAL-ASSET-QUEUE.md — superseded — reference(2026-07-08) — props→PLACE-ASSET-QUEUE; creatures→sprite transition
- docs/VQ2-RESPEC.md — operations — build-plan/ACTIVE(2026-07-15)
- docs/WALK-CARD-DEALING.md — proposed — system-spec/proposed-runtime-seam(2026-07-12) — secret/discovery semantics ceded to wave-04 (07-22 note)
- docs/WALK-CONSUMPTION.md — current-canon (built) — system-spec/"draft"(2026-06-30) — ⚠ foundational per later specs
- docs/WALK-NATIVE-A.md — current-canon — BUILT(2026-07-12) — WDV-3/4/5 open forward pointers
- docs/WALK-REFRESH.md — proposed — system-spec/specced(2026-07-01) — §3 superseded by SPICE-RAISE (self-noted)
- docs/WALL-VOLUMES-PRACTICALS.md — proposed — system-spec/SPECCED(2026-07-12)
- docs/WIRING-MAP.md — research — audit(2026-07-02) — minor-arcana retire-vs-repoint call open
- docs/WORLD-TURN.md — proposed — system-spec/specced(2026-07-01) — §7 await review (07-01 cohort)

## 5. Census — docs/ subfolders, root, Engine, dev, ui-sketches, Reference

### docs/procedural-dungeon-direction/ (the program's own set — all current)
- PROCEDURAL-DUNGEON-DIRECTION.md (front door) · FOUNDATION.md · QUESTIONNAIRE.md (PRESERVED) · PHASING-FRAMEWORK.md · CLAY-PROOF-LADDER.md · FEATURE-PROMOTION-LEDGER.md · IMPLEMENTATION-HOLD.md (ACTIVE) · FABLE-CANON-AND-SCOPE-REFACTOR-PROMPT.md (this pass's assignment) — all current-canon within the program.
- wave-01/ wave-02/ wave-03/ wave-04/ wave-05/ wave-06/ wave-10/ — CLOSED chronological wave records + phasing audits: the semantic authority for their subjects.
- wave-07/ wave-08/ wave-09/ wave-11/ wave-12/ — OPEN/PROPOSED records created by this pass (Fable-proposed dispositions; nothing closed).

### docs/vision-quests/
- BRAINSTORMING-SESSION-RECORD.md — research — external image pointers unverifiable
- FIGURINE-LIFE-PASS-VISION-QUEST.md — proposed — no frontmatter
- Genesis Map Vision Quests.md — proposed — no frontmatter
- MAP-VISION-QUEST-IMPLEMENTATION-GUIDE.md — proposed — ⚠ claims to live "outside the repository" while committed here
- PC-MONSTER-SPRITE-STYLE-GUIDE.md — accepted-supporting — LOCKED by Adam 2026-07-12 — ⚠ names SPRITE-SHEETS/SPRITE-TRANSITION as runtime authorities w/ unreconciled visual preamble; superseded in style law by ART-DEPARTMENT (2026-07-15 pixel canon)
- REALM-SPRITE-MATRIX-VISION-QUEST.md — research — reference-only
- REALM-STYLE-FAMILIES-VISION-QUEST.md — proposed
- SPRITE-SPREAD-BESTIARY-NOTES.md — research — reference-only
- docs/reference/TERRAIN-CENSUS-2026-07-07.md — research — TABLETOP-VISION consumer

### Repo root
- CLAUDE.md — current-canon — operating contract (routing line to docs/canon/ added this pass)
- AGENTS.md — current-canon — defers to CLAUDE.md by design
- README.md — current-canon — ⚠ frontmatter updated 2026-06-21 (stale date, content mostly still true)
- table-registry.md — generated-report — auto-generated 2026-07-02 snapshot

### Engine/00. _System (legacy Arcana-era seed layer)
- Cosmological Framework.md — historical — Firmament/Vale cosmology; predates Genesis product framing
- Dungeon Procedure Update for v 0.2.md — historical — checklist far behind v3.1
- Early Stage Design Constitution.md — historical (status says active) — ⚠ no cross-ref to docs/DESIGN.md family; superseded in practice by DESIGN.md + CLAUDE.md
- Resources.md — operations — untitled external-link list
- Urban Generator v3.0 Design Doc.md — superseded — ⚠ DEAD REDIRECT: target "01. _Templates/Urban Procedure v3.0 Design Doc.md" does not exist
- World Layer Constitution.md — historical — legacy cosmology companion
- _Ultimate Product Goal 0.01.md — historical — "Tarot Vending Machine" era vision; superseded by Genesis product framing

### Engine/02. _Procedures (table-source procedures; census = class only)
Live-canon: Character Genesis Procedure v1.0 · Starting State Procedure v1.0. Explicitly archived-source: Settlement & District Generator v1.1 (→URBAN-FABRIC/src/world/urban.js) · Tavern Generator 2.0 (→Engine tables + codex-roll.js). Historical: Pen & Paper Dungeon v1.0. Empty file: Dungeon Set Up v1.0 (⚠). Remainder (Adventure/Job/Shop/Song/Travel/Treasure/Urban*/Wilderness/Quick NPC/5-Room Dungeon/Dungeon Encounter/Quick Guide/_START_New World) — table-source procedures consumed via the compiled pipeline; the dungeon-procedure pair (Dungeon Encounter v2.0 vs 5-Room v3.1) lacks a supersession note (⚠). The whole dungeon-procedure family is design-superseded by the closed Waves 1-6 program at design level; runtime still runs on the compiled current tables until Wave 12 authorizes any cutover.

### ui-sketches/mock-frames/vq-battle-scenes/
- CLAUDE-IMPLEMENTATION-HANDOFF.md — accepted-supporting — graphics north-star bridge (adopted by GRAPHICS-NORTH-STAR.md)
- NOTES.md — research — per-frame friction notes
- WALK-NATIVE-DIORAMA-CONTRACT.md — proposed — projection contract under WALK-CARD-DEALING

### dev/ (top level + model-qa; audits/playtests = implementation evidence)
- GAUNTLET-FINDINGS.md — generated-report (do not hand-edit)
- adam-review-bench.md — operations — ⚠ "done" status vs "calls for you to make" body ambiguity
- model-coverage-report.md · playtest-chase-0704-findings.md · playtest-findings-shakedown.md · table-order-report.md · top-band-uniqueness-report.md — implementation-evidence
- realm-mythic-proposals.md — proposed — only Gloom exemplar approved
- table-lint-baseline.md — operations (diff baseline by design)
- model-qa/: README (operations) · REFERENCE-DIRECTION (accepted-supporting) · A1-A2-REVIEW / FACETED-MISMATCH-AUDIT / battlemap-playtest-FINDINGS / chassis-catalog / creature-coverage-report (implementation-evidence; coverage claims are dated snapshots ⚠) · pose-refs / refs-highseas-NOTES / sprite-sheet-prompts (research; sprite-sheet-prompts' "sprites were retired" claim is itself superseded by the 07-09 sprite transition + 07-15 pixel canon ⚠)

### Reference/Procedural-Dungeon-Research/
- SOURCE-INDEX.md — research — VERIFIED ledger (R1/R2 supplemental inputs; never authority)
- claude-tactics-rpg-tutorial-mining-2026-07-22.md — research — R2; dispositioned in Wave 6 §15.3

## 6. Supersession map (explicit chains)

Design-level supersessions (newer ruling owns the topic; older text preserved):
- SPICE-CURVE.md §1 static distribution → **SPICE-RAISE.md** (band-first rolling). Mutually noted.
- CRIT-MAGNITUDE.md ladder/`obliterated` → **wave-02 §10.11.28-10.11.50** (15/3/1/1, d3+2 lenses, TerminalDisposition, Mythic/Worldbreaker profiles). Doc + implementation deliberately not yet amended; design authority = the wave record.
- BATTLEMAP.md 12-zone combat → **Wave 10 §11.6-11.7 exact-cell SpatialPlan authority** (accepted, unbuilt; zones become derived fallback).
- DESIGN-GUIDE.md T6 sequence → TABLETOP-VISION.md §6 → **Wave 10 BattleMat/EngagementLens + SceneTray family** (visual destination). TABLETOP-VISION remains taste/evidence input.
- DIRECTION.md (2026-07-03 reshape: playability gate / renderer freeze / spec moratorium) → overtaken by the July graphics-convergence program, the procedural-dungeon wave program, and the Wave 10 first-implementation-priority ruling (canonical mechanics → BattleMat+EngagementLens → provider-neutral DM seat → persistence/recovery). Historical trajectory snapshot; banner added.
- W10 F10.6g bounded player rotation → **Wave 3 §12.13 fixed production camera family** (recorded in wave-10 README amendment).
- DUNGEON-GRAPH.md resident-scaled wording → **P3.4/P6.4 provenance-first scale domains**.
- Creature 3D model lane (REALM-MODEL-PLAN.md, REALM-MODELS-P3.md, BESTIARY-COVERAGE.md, CREATURE-MODELS-P2.md creature scopes; MODEL-GRAMMAR.md) → **SPRITE-TRANSITION.md (2026-07-09 LOCK)** + **ART-DEPARTMENT.md (2026-07-15 pixel canon)**. MODEL-FOUNDRY re-scoped to trays/props/architecture.
- PC-MONSTER-SPRITE-STYLE-GUIDE.md (faceted vision variant, 07-12) style law → **ART-DEPARTMENT.md** (pixel register canon) + **ART-DIRECTION-CANON.md** (faceted RESERVE register).
- VISUAL-ASSET-QUEUE.md → PLACE-ASSET-QUEUE.md (props) + sprite transition (creatures).
- MICRO-PROPS.md · ROOM-GRAMMAR.md → **BEAUTY-WAVE-5.md** (IA-3 et al.).
- PHASE-3-DIRECTOR-BRIEF.md → **PHASE-3-WAVE-PLAN.md**.
- TABLE-REAUTHORING-PREP.md §3 → **REAUTHORING-SWEEP-PLAN.md**.
- TAROT-SESSION.md Major schema/op vocabulary → **TAROT-2.md** (DRAW/vector/roller-hook stays with TAROT-SESSION).
- BLOCKWRIGHT.md diorama role → **BATTLE-THEATER.md** (scenery/FX/fallback pivot; recorded only in siblings).
- Connection/portal/secret/vertical semantics in DUNGEON-GRAPH / ROOM-SHELL-COMPILER / WALK-CARD-DEALING / PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH → **wave-04 record** (07-22 authority notes, matched pair + sketch self-flag).
- STAGE-C-ART-DIRECTION-REVIEW items C4.1/E0 → **WALL-VOLUMES-PRACTICALS.md** (mutual `supersedes-gate`).
- Engine legacy cosmology (_Ultimate Product Goal 0.01 / Cosmological Framework / World Layer Constitution / Early Stage Design Constitution) → **docs/DESIGN.md + CLAUDE.md product framing** (historical seed layer; no in-file pointers — flagged as debt).
- QUESTIONNAIRE.md "Live bookmark" + "Fable readiness" gates (W2-era) → **wave-06 §15.8 closure + FABLE-CANON prompt** (bookmark refreshed this pass).

## 7. Document-health debt register

Recorded, not silently fixed. Items marked [routing-fixed] received a status banner or pointer in this pass; everything else is left for its owning lane.

**Stale status fields (doc says pending; system is built/landed):**
ADVANCEMENT, DEATH-AND-REBIRTH, DIFFICULTY, EVENT-CONTRACT, SOCIAL, WALK-CONSUMPTION ("draft" era-stamps from June); DETECTED-EVENTS, DM-CONTRACT-ARTIFACT, ITEM-LEGACY, HOTFIX-QUEUE-2026-07-06/-07 + HQ3-A/B/C/D (built 07-07); NPC-COHERENCE-DIAL, NPC-ROLE-REALMS, NPC-PRESENCE-AND-HOOKS (merged per NPC-COHERENCE-FIXES); JOB-WALKS, PLAY-LENS, REALM-WIRING, REALM-ENRICHMENT-WRITING, REFERENCE-SHELF, KENNEY-MESH-AUDIT, OFFLINE-ART-FOUNDRY-RESEARCH ("not started"/"in progress" overtaken); GIT-LFS-MIGRATION ("READY" but executed 07-18); OVERNIGHT-TABLETOP-2026-07-07 ("ACTIVE" but concluded); PHASE-3-DIRECTOR-BRIEF ("awaiting" but superseded); UI-VISION-QUEST ("executing", completion unrecorded); P1-WIRING; DRESSING-ATMOSPHERE.
**Header-vs-body contradictions ("DRAFT/awaiting review" headers over in-doc "RESOLVED — Adam's rulings" sections):** CHROME-REKEY, COSMIC-REKEY, LOST-WORLD-REKEY, HOOK-WALKS, SHIP-TRAVEL, TIYL-WEIGHTED-STARTS, PLACE-GEN (binding addendum).
**Self-expired artifacts never archived:** FABLE-WINDOW-2026-07-06.md.
**Dead links / stale pointers:** Engine/00. _System/Urban Generator v3.0 Design Doc.md redirect target missing; NPC-ROLE-REALMS → docs/table-registry.md (real: repo root); NPC-COHERENCE-DIAL → un-archived GPT advice path + `[[project-genesis-codex]]` (also in NPC-PRESENCE-AND-HOOKS); MAP-VISION-QUEST-IMPLEMENTATION-GUIDE claims to live outside the repo; RISK-REGISTER re-score trigger elapsed; PLAYTEST-BUGS not reconciled against HQ2/HQ3 fixes; wave-10 PHASING-AUDIT intro paragraph says P10.8 awaits closure (closed at 11.69); wave-02 README "cut remains under review" vs audit ACCEPTED; Wave 6 2014-vs-2024 page-index edition flag (dev/model-qa/*-page-index.json); F4.4a Hazard Severity "20d6/~70 ft" prose contradiction (content-correction debt); Dungeon Set Up v1.0.md is an empty file.
**Open review cohorts (gates named, unresolved):** the 2026-07-01 "await Adam's voice review" cohort (TABLE-GAPS-070126, REGIONS-NAMES, TIYL-DEEPENING, WORLD-TURN, WALK-REFRESH §skins, ECONOMY-SINKS valuables); the 2026-07-06 "post-Fable build DEFERRED" cohort (SCENE-RISK-CONTRACT, SEAT-ADAPTER, SOCIAL-SPINE-FIXES, STATE-HYGIENE-EVAL, TABLE-ROW-CONTRACT, TAROT-2, THEATER-NEXT, TRANSITION-CONTRACT, CHASE-BITE, FRAME-FIELD, BESTIARY-DASHBOARD, DETECTED-EVENTS✓, TABLE-ATLAS✓ — ✓ = escaped and built); DESIGN-REVIEW-2026-07-15 open meeting gate (largely absorbed by the wave program — confirm); SPICE-RULER blessing; REALM-RENDER-STYLE ruling (absorbed by per-realm finish law — confirm); dev/realm-mythic-proposals 10 realms unapproved; QUESTIONNAIRE live bookmark [routing-fixed this pass].
**Duplicate-data debt:** REALM-BESTIARY-SCAN vs DRAFT; REALM-BESTIARY-ICONS folded but unmarked; UNIFICATION-WAVE "art direction CLOSED" overclaim.
