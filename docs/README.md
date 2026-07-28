---
type: docs-index
branch: Genesis
created: 2026-06-21
---

# Genesis — Docs Index

All Genesis design docs, specs, research, and operational notes live in this folder
(`~/Desktop/Work/projects/Genesis/docs/`). Only `README.md` (the project front door) and
`table-registry.md` (a generated build artifact paired with its `.json`) stay at the repo root.

**Path convention:** file paths written inside these docs (e.g. `genesis.html`, `src/creator/bardo.js`,
`Reference/SRD-Data/spells.json`) are **relative to the Genesis repo root**, not to this `docs/` folder.
References to *other docs* are by name and resolve as siblings here.

## Quick lookup — if you're looking for X, go to Y

Skip the full index below when you already know the topic. This table exists so an agent (or
Adam) can jump straight to the right doc instead of grepping/reading its way there.

| Looking for... | Go to |
| --- | --- |
| **The current ruling on anything (canonical front door)** | **`canon/README.md`** — precedence law, product scope, ownership map, decision index, question coverage, open founder questions, glossary, document map |
| What to work on next / the live build queue | `NEXT-STEPS.md` (top section only — older queues archived in `NEXT-STEPS-ARCHIVE.md`) |
| Orientation for a new session | `HANDOFF.md` |
| Why a decision was made | `DESIGN.md` (locked decisions, dated) → `canon/DECISION-INDEX.md` for stable ids → then the linked spec |
| Which document is current vs historical/superseded | `canon/DOCUMENT-MAP.md` (census + supersession map + health debt) |
| Canon/scope consolidation assignment (executed 2026-07-22) | `procedural-dungeon-direction/FABLE-CANON-AND-SCOPE-REFACTOR-PROMPT.md` → output = `canon/` + PROPOSED wave-07…12 records awaiting Adam |
| A subsystem's exact contract/behavior | the matching `type: system-spec` doc, listed below |
| Realm identity / style / touchstone | `REALM-HOOKS.md` (current, re-keyed) — `data/realms.js` is the older baseline |
| Creature stats, names, per-realm rosters | `data/bestiary.js` (SRD/global) · `dev/model-qa/realm-bestiary-draft.json` (per-realm, compiled from `REALM-BESTIARY-DRAFT.md`) |
| 3D model / render style rules (silhouette, value, pose) | `MODEL-FOUNDRY.md` (the 6 laws) |
| Generated-asset compilers, sprite emotes, and boundary auto-tiles | `ASSETFORGE.md` — shared quarantine/proof/admission protocol, built sprite-emote vertical slice, and boundary compiler specification |
| Shared procedural battlefield and town-tray composition | `BATTLEMAP-TOWNTRAY-COMPOSITION.md` (high-priority accepted direction; implementation unauthorized) |
| Table architecture (markdown source → compiled JSON) | `Two tracks run in parallel` section below + `compile-tables.py` |
| Module list / what owns what symbol | `manifest.json` (repo root) |
| Historical "what happened" / past sessions | `CHANGELOG.md` (newest first; older entries in `CHANGELOG-ARCHIVE.md`) |
| Something that used to be here | check `NEXT-STEPS-ARCHIVE.md` before assuming it's gone |

## Genres (the `type:` frontmatter taxonomy)

**Canon** (`type: canon`) — the routed canonical front door (created 2026-07-22; the Fable
canon-and-scope pass). Small index-and-law files, never spec duplicates: `canon/README.md`
(precedence law) · `canon/PRODUCT-SCOPE.md` · `canon/SYSTEM-OWNERSHIP.md` ·
`canon/DECISION-INDEX.md` · `canon/QUESTION-COVERAGE.md` · `canon/OPEN-QUESTIONS.md` ·
`canon/GLOSSARY.md` · `canon/DOCUMENT-MAP.md`. Start here for "where is the current ruling?"

**North star** (`type: design-guide`) — the dream, the look, and the ordered path; sits *above* the decision registry.

- `CLAYROOM-RESET-LADDER.md` — **the Clayroom reset/proof ladder (CL-R0…CL-R6)**: the Clayroom is a deterministic procedural acceptance fixture, and this is the renderer/fixture-trust gate that must pass before C1H, C1I, or Guard Post 1 may consume it. Also owns the diagnostic-clay surface contract, the clay capture/receipt law, Lighting Lab 2.0's recipe contract, the bounded Sprite Editor crosshair delta, and the Clayroom Workbench boundary. CL-R0 BUILT 2026-07-23. (2026-07-23)
- `GOLDEN-SITES-CATALOG.md` — living Golden Site authority: four honest status gates and portfolio briefs. `GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` defines the story→walk→site identity→host program→transform→materialization→semantic plan→composition→projection contract and classifies the twelve as host, transform, scale/relationship, or substrate proof roles rather than runtime site types. The Mine-standard generator-grade suite is `SITE-1-GUARD-POST-SPEC.md`, `SITE-2-CAMP-SERVICE-SPEC.md`, `SITE-4-MONASTERY-COMMUNE-SPEC.md`, `SITE-5-MINE-WORKSHOP-CONCEPT.md`, `SITE-6-PRISON-CUSTODY-SPEC.md`, `SITE-7-NATURAL-LAIR-SPEC.md`, and `SITE-10-URBAN-INSTITUTION-SPEC.md`; each defines its five-expression family, culture/circumstance, learning-first build, zones, circuits, plans, generation, rejection/fallback, runtime facts, proof receipt, and first visual demonstration without overstating its gates. `TAVERN-VENUE-ROUTING-BRIEF.md` records the live tavern audit and routes `VENUE-TAVERN-01` as a shared Golden Venue fixture rather than Site 13. `BUILDING-PROGRAM-TABLE-FAMILIES.md` records the superseding 42-roll ruling: typed buildings use seven coherent chassis families plus program operation/current-scene/Spice and realm-doctrine layers; Prison/Custody owns a dedicated family governed by Site 6, and the d300 remains for untyped discovery and explicit adaptive reuse. The Tavern and all-building receipt packets live under `../Reference/Tavern-Study/` and `../Reference/Building-Type-Roll-Study/`. `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md` classifies live, composed, authored-but-unwired, interpretive, and proposed-adapter sources; preserves current rolled compositions; and supplies the required `rollerLineage` / `sourceRollRefs` contract. `GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md` makes real-roll portal/support aprons, context cards, reusable background images, far fields, atmosphere, knowledge safety, and context-off/on receipts part of the shared Golden Site proof. `SITE-3-DORMANT-CONCEPT.md` preserves the accepted dormant-site foundation for its deliberately late/last pass. Site 6's returned initial depth/doctrine evidence lives in `../Reference/Prison-Custody-Study/`. Future sessions follow `GOLDEN-SITE-CONCEPTING-GUIDELINES.md`; choices route to `GOLDEN-SITES-FOUNDER-QUEUE.md`, evidence/render work to `GOLDEN-SITES-PROOF-QUEUE.md`, and implementation detail to the owning composition/material/context specs. (ontology/venue research pass 2026-07-26)
- `GRAPHICS-CONVERGENCE-CHARTER.md` — governing graphics authority: protect the walk/table engine while deliberately converging generated scenes on the approved mockups; visual-compiler boundaries, C0-C8 ladder, no-human production contract, and Claude session protocol. (2026-07-12)
- `ART-DEPARTMENT.md` (`type: style-canon`, sibling of `ART-DIRECTION-CANON.md`) — the pixel sprite register's canonical home: live-corpus state, the per-realm style law index (quoted verbatim), and the two regeneration runbooks (regen an in-style sheet / fold a staged realm live). Start here for pixel style; then use `../dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md` for the preferred explicit batch-packet grammar, dynamic subject-based cell aspect, QA, and receipts. (2026-07-24)
- `DESIGN-GUIDE.md` — the pillars, the visual bible, the T0–T7 roadmap. When it and `DESIGN.md` disagree, fix the drift in the same change. (2026-07-01)
- `DIRECTION.md` — the standing directorial trajectory (2026-07-03 reshape): the playability gate, renderer decency-gate-then-freeze, soak-before-build, the batched Adam ledger, the v1 ship-gate. Supersedes NEXT-STEPS ordering where they disagree. (2026-07-03)

**Decision log** — the registry of locked calls; the index of decisions, detail lives in the specs.

- `DESIGN.md` — every locked decision in a dated table. **Start here.**

**System specs** (`type: system-spec`) — normative "this is how the subsystem works." The buildable contracts.

- `ASSETFORGE.md` (`type: production-machinery-spec`) — the shared generated-asset compiler
  protocol: manifest, exact prompt packet, quarantined ingest, deterministic assembly, adversarial
  proof, receipt, and explicit admission. The sprite-emote factory is the first built vertical
  slice; the boundary auto-tile compiler and ten other reusable visual factories are specified as
  expansions. (2026-07-27)
- `NEW-GAME-FLOW.md` — the bardo / guided new-game passage.
- `CHAR-CREATION.md` — the two-layer character creation system.
- `SPATIAL-MODEL.md` — the lazy hex/node world-geometry model.
- `SPICE-CURVE.md` — the 5-band intensity ladder.
- `LOOT-REMAP.md` — the rarity-axis loot system.
- `ITEMS.md` — *(planned)* the type/instance split for gear (a generated SRD index for the objective
  facts, inventory entries become `{id,name,conditions}` instances) — the bestiary pattern, reapplied.
- `TIER-SCOPE.md` — this version caps at **Tier 2 (levels 1–10)**; T3/T4 deferred to the expansion. The cap-enforcement layers + what's deferred-but-inert. (2026-06-26)
- `EVENT-CONTRACT.md` — the typed-event interface between the DM (narration) and the script (state). The spine the advancement/difficulty/combat specs all reference.
- `ADVANCEMENT.md` — the XP economy, thresholds, and rest-gated leveling (BUILT to L10 2026-06-26).
- `DIFFICULTY.md` — *(planned)* how the world calibrates and answers challenge: regional power bands, murder-hobo escalation, threat-signaling.
- `COMBAT.md` — *(planned)* the theater-of-mind / 5.5 combat engine (zone bands, cover from terrain specs).
- `DEATH-AND-REBIRTH.md` — the death loop: the 49-day bardo gap, the 14 vision-rolls against the dead PC's Saga, the corpse/loot decay, class-weighted faction proximity at creation, and the connected-plane (Universe v3) successor model.
- `DM-BRIDGE.md` — the local dev/playtest harness: Claude Code as the AI DM over a file/HTTP bridge (no API tokens), emitting `EVENT-CONTRACT` events the app applies. Makes the integrated loop actually playable in development.
- `RELEASE-CHANNEL.md` — the Play/Dev port split: worlds live in the browser keyed by origin, so port 5175 (Adam's real universe) must always serve a blessed-stable checkout via a dedicated `play` branch + `Genesis-play` worktree; Dev moves to 5177. The `dev/promote-to-play.sh` ritual + `dev/serve-play.sh`. (2026-07-03)
- `CODEX.md` — *(spec draft 2026-06-24)* the relational entity layer: NPCs / Locations / Items / Factions as wikilinked records in `w.codex` (engine rolls the atoms, AI assigns meaning + links); prep casts the codex; the Start/End-Session frame. Born from the Saltrest playtest (the DM invented the whole cast because prep rolls the stage, not the players).
- `ECONOMY.md` — the money loop's v1 buy/sell spine: pricing off SRD `cost` + a rarity band, place-tier shop stock, buy/sell validators emitting `item_changed`. Engine + data only — the shop panel is `SHOP-UI.md`. (2026-07-01)
- `IN-SESSION-UI.md` — the in-session game view rebuilt to the Claude-Design mockup: persistent status sidebar, framed-tab rail, tabbed slide-in panels, full-bleed narration feed. (2026-07-01)
- `SHOP-UI.md` — *(BUILT 2026-07-01)* the contextual Buy|Sell panel marrying `IN-SESSION-UI.md`'s panel system to `ECONOMY.md`'s engine: `open_shop` / `w.shops`, confirm-on-plaque flow, attitude-tinted prices, merchant coin pool hidden. (2026-07-01)
- `DICE-OVERLAY.md` — *(BUILT 2026-07-01)* the polyhedral roll theater: CSS/SVG dice tumble over the feed on every player-facing roll, click-to-roll, engine-predetermined results, crit-magnitude stage-2. (2026-07-01)
- `TABLETOP-UNITS.md` — the SPEC-LOCKED build queue for TABLETOP-VISION's pre-alpha cut: U1–U7 per-unit (exact seams file:line, locked payloads, §9-mapped acceptance + mutation checks, effort tiers). Key finding: combat stage-mode already IS the end-state layout — the build un-gates it. Soak-gated. (2026-07-07)
- `TABLETOP-VISION.md` — the visual end-state: the game as a tabletop of miniatures — the three laws (table renders only the dice / miniature ontology / the invisible hand is the DM), 9-class piece taxonomy + registry schema, tray grammar, centerpiece law off existing walk rolls, two-lane overlays, the V1–V6 layer map + 3-column shell, pre-alpha cut, acceptance gates. SPECCED 2026-07-07 (Fable final window; Adam-exempted from the §3.4 moratorium — spec only, build stays post-soak). Census appendix: `reference/TERRAIN-CENSUS-2026-07-07.md`.
- `ASSET-PROMPTS.md` — *(working-doc)* the T1 image-generation shopping list for Adam's image-gen sessions: style-lock prompt + per-asset specs (title wordmark, scene plaque, medallions, seamless textures, icon gaps, battle-theater advance-buys). (2026-07-01)
- `MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md` (`type: production-slate`) — the definitive
  300-model Meshy month: 75 high-reuse donor families × four geometry/state variants, exact
  exclusions protecting procedural/extrusion/faced-box/sprite lanes, an eight-family calibration
  gate, production order, admission contract, and the first M019 wagon-chassis reference. Reference
  inputs and prompt records live in `Reference/Meshy-Premium-Month-1/`. (2026-07-25)
- `ADVANCEMENT-RETUNE.md` — the advancement spec's structure-locked, numbers-provisional retune (2026-07-01); framework now, telemetry-tuned numbers from play.
- `AUTOMATED-PLAYTEST.md` — the Layer-1 automated-playtest loop (AI player × real DM stack); run parameters locked 2026-07-03.
- `BATTLE-THEATER.md` — the FFT-grammar three.js battle stage — low-poly 3D, PSX grit, T1 build-ready, T2 gated on pack download (2026-07-03).
- `BATTLE-VISUALS.md` — making the fight worth looking at — Phase A build-ready, Phase B is the style-probe session, Phase C is T6 (2026-07-03).
- `BATTLEMAP.md` — the 12-zone battlemap: spoken moves, an honest diorama; structure build-ready, art awaits the STYLE-PROBES verdict (2026-07-01).
- `STAGE-C-ART-DIRECTION-REVIEW.md` — independent visual acceptance of Wave C: canonical multi-patch terrain correction, sprite/prop architecture findings, no-human production contract, and the ordered route from debug shells to frames 12/19 (2026-07-12).
- `GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` — executable no-human graphics research wave: path-traced oracle, UV unwrap, atlases, GPU telemetry, seeded visual distribution, transparency classification, and Claude's multi-agent execution gates (2026-07-12).
- `PHASE-3-DIRECTOR-BRIEF.md` — (`type: orchestration-plan`) Fable's handoff into Phase 3: the landed `legacy→oss` geometry flip + stabilization evidence, a linked path to the full Codex plugin-rec suite + plan, the GP-2..4 terrain, the oracle/spend calls that are Fable's, and Claude's smallest-correction-first recommendation (2026-07-13).
- `BLOCKWRIGHT.md` — the procedural visual layer — blocky, untextured, fast, no art assets; build-ready (2026-07-01).
- `BREACH.md` — the Breach & the Nightmare — the bell-curve skin, and where the world gets thin; batch-3 unit (2026-07-02).
- `COMBAT-LIFECYCLE.md` — the missing seam between the built combat stack and live play — built (2026-07-03).
- `COMBAT-TRACKER.md` — surfacing the built fight — panel + prose twin, wired to a real live fight by COMBAT-LIFECYCLE (built).
- `COMPANIONS.md` — hirelings + the one sidekick; build-ready except the sidekick class-data extraction step (2026-07-01).
- `CONSEQUENCE-LADDER.md` — the Consequence Ladder — spice bands earn mechanical story-weight without fractaling; specced draft (2026-06-29).
- `CRIT-MAGNITUDE.md` — the Critical-Magnitude System — nat20/nat1 second-d20 spike, count×intensity curve; locked (2026-06-23).
- `DIGEST-DIET.md` — stop re-shipping the world every turn — the digest-diet spec; specced, builds before ON-DEMAND-GEN (2026-07-01).
- `DM-CHARTER.md` — the DM Charter — the flagship narrator-voice contract; living doc (2026-06-22).
- `DM-SEAT.md` — the API-direct DM (the launch-unlock, now affordable) — GLM ~$1/hr; specced, build-ready, forks resolved (2026-07-03).
- `DURABILITY-TRIO.md` — world export/import · environmental rust · Chronicle⇐Ledger — three small build-ready units (2026-07-01).
- `ECONOMY-SINKS.md` — lodging + valuables sell content; build-ready overnight batch, valuables table PROVISIONAL until the craft pass (2026-07-01).
- `FOREVER-STORAGE.md` — the forever-persistence promise needs a bigger vault — protection-class guards; specced (2026-07-02).
- `JOB-WALKS.md` — the notice board that mints adventures — the 300-row job board scales and generates walks; specced (2026-07-02).
- `LEVELUP-PICKER.md` — interpretive level-up picks, in-app, minimal; build-ready (2026-07-01).
- `LOOSE-ENDS-070126.md` — social gifts wiring + Outlandish intrusion hooks — two small build-ready closures (2026-07-01).
- `MODEL-GRAMMAR.md` — MODEL-GRAMMAR — recipes, not models; the reusable-parts system for creature figures (SPECCED, G1-G4 BUILT 2026-07-03).
- `MONSTER-TACTICS.md` — the script proposes, trash plays itself, morale binds — monster AI tactics; build-ready (2026-07-01).
- `ON-DEMAND-GEN.md` — the noun supply chain — on-demand generation of NPCs/interiors/items behind the screen; deep-run ready (2026-07-01).
- `OUTLANDISH-REALMS.md` — the frozen vocabulary + the d300 tag pass for outlandish realms; BUILT, PROVISIONAL pending Adam's skim (2026-07-03).
- `PRE-PLAYTEST-GAUNTLET.md` — the automated bug sweep run before the live bridge playtest; specced, awaiting execution.
- `PREP-AUTOPILOT.md` — latency leg 2's missing trigger — the smallest overnight-batch unit; build-ready (2026-07-01).
- `RANK-SMITH.md` — an NPC role that wakes the next rung on a rank ladder; CONTENT STUB, no call site yet (2026-07-03).
- `REGIONS-NAMES.md` — the land gets identities, the people get cultures — region + culture layer; mechanics build-ready, samples await review (2026-07-01).
- `REPUTATION.md` — the world remembers what it SAW — reputation/epithet system; build-ready (2026-07-01).
- `ROLL-BRANCHES.md` — the check resolves the moment the dice land — zero-second-inference roll branches; build-ready (2026-07-01).
- `SESSION-PREP.md` — the Session-Prep System — the AI DM preps like a human DM; draft (2026-06-23).
- `SKIN-GRANTS.md` — the skin's promises become the walk's contents — realm skin-motif grants; BUILT (2026-07-02).
- `SOCIAL.md` — Attitude, Parley & Morale — the social analog of combat; draft (2026-06-28).
- `SPECULATIVE-PREFETCH.md` — Speculative Prefetch — pre-fetching the likely-next content; draft (2026-06-30).
- `SPRITE-SHEETS.md` — current slicing/keying/runtime provenance; its old fixed `6×6` and hero-single production formatting is retired. New packets use `../dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`. (2026-07-24)
- `SRD-MECHANIZATION.md` — closing the last d20 gaps — check spine, conditions, concentration, combat actions, death saves, exhaustion; built (2026-07-01).
- `STYLE-PROBES.md` — settling the §II.0a visual-style gate with one hybrid probe; specced (2026-07-01).
- `SYNTHESIS-CONTRACT.md` — the Synthesis-Pass Contract — how rolled atoms become prose; draft (2026-06-23).
- `TABLE-EDIT-SAFETY.md` — hand-editing the Engine table corpus without cascading bugs; locked (2026-07-03).
- `TABLE-GAPS-070126.md` — the tables the new systems now want — five new tables + thin-expansion unit; specced (2026-07-01).
- `TAROT-SESSION.md` — the Session Draw — tarot as the session's mutator; Majors samples await review, minors build-ready (2026-07-01).
- `TIYL-DEEPENING.md` — This Is Your Life — deepening (names · presentation · the prep bridge); build-ready (2026-07-01).
- `TIYL-UI-PORT.md` — the bardo leaves the centered-card era — TIYL ported to full-bleed UI; Sonnet-executable (2026-07-03).
- `TRAVEL-WALKS.md` — the journey IS a walk — travel consumes the walk roller; build-ready (2026-07-01).
- `URBAN-FABRIC.md` — typed buildings, lazy districts, and the tavern as a surface; built batch-3 unit 9, with Golden-grade semantic/spatial venue composition still open (status re-audited 2026-07-26).
- `BUILDING-PROGRAM-TABLE-FAMILIES.md` — accepted typed-building correction: seven coherent family chassis tables, including dedicated Prison/Custody, plus per-program arrangement, current-scene, Spice, and realm-doctrine layers; the flat d300 is no longer the primary selector for a committed building type (2026-07-26).
- `WALK-CONSUMPTION.md` — making the DM run the walks it's handed (and capture as re-entry); draft (2026-06-30).
- `WALK-REFRESH.md` — live rosters, full-suite treasure, the rolled skin; build-ready except skin-table voice review (2026-07-01).
- `WORLD-TURN.md` — change-over-time, unified — faction clocks, drift, NPC life-events; build-ready except drift/life-event samples (2026-07-01).

*Fable-window spec batch (2026-07-06 — all SPEC-LOCKED, build deferred post-Fable):*

- `SOCIAL-SPINE-FIXES.md` — type: system-spec — the BUG-17/18/03 + caster-discoverability contract-repair cluster (attitude/social DC/cast visibility/digest HP).
- `TRANSITION-CONTRACT.md` · type: system-spec · first-class time/location/state transitions (tick table, advance_clock, move_node, start_walk, travel_start, knockout) · SPEC-LOCKED 2026-07-06, build deferred.
- `SCENE-RISK-CONTRACT.md` — the fairness contract: danger/reward bands, telegraphs, escape modes, death stakes on every walk; the digest slice that tells the DM *why* a scene is dangerous.
- `ITEM-LEGACY.md` — item lifecycle: death→corpse→scavenge→recovery custody contract (type: system-spec, SPEC-LOCKED, build deferred).
- `SPICE-RAISE.md` — type: system-spec — the adopted spicy-world stance: tier-weighted band-first rolling; supersedes the 66/20/9/4/1 share law as play distribution.
- `TABLE-ROW-CONTRACT.md` — table family schemas + row test + family lint/baseline; spec-locked (2026-07-06), build deferred. Extends TABLE-EDIT-SAFETY.md.
- `TAROT-2.md` — tarot maturation: strict Major schema, op vocabulary, landing receipt, minors metadata (SPEC-LOCKED 2026-07-06, type: system-spec).
- `DM-CONTRACT-ARTIFACT.md` — type: system-spec — the generated machine-readable DM↔engine contract (dm-contract.json) + its drift guard.
- `STATE-HYGIENE-EVAL.md` — the provider eval harness: golden-turn replay through the real engine, scored on state hygiene (events land, values move, clock ticks, codex remembers); the DM-SEAT bake-off gate. (2026-07-06)
- `SEAT-ADAPTER.md` — the /seat adapter boundary: Genesis wire shape, provider dialects, normalized SSE, cost telemetry; harness/product boundary law. (type: system-spec)
- `DETECTED-EVENTS.md` — type: system-spec — the declared→detected migration sweep (GPT outside-read item 1); audit table + 5 locked migrations. BUILT 2026-07-07 (`feat/detected-events`).
- `THEATER-NEXT.md` — type: system-spec — battle theater next steps: terrain_change / screenshot gates / dirty keys.
- `BESTIARY-DASHBOARD.md` — type: system-spec — the Monster Manual as standing QA/coverage dashboard (extends BESTIARY-MANUAL.md; spec-locked 2026-07-06).
- `FRAME-FIELD.md` — the frame-field schema: per-variant stat-chassis declaration for pooled table rows + the creature frame doctrine (SPEC-LOCKED 2026-07-06, build deferred).
- `TABLE-ATLAS.md` — type: system-spec — Reference Shelf app #3; the read-only Table Atlas + its two data-seam units (table-usage split, roll-count telemetry). BUILT 2026-07-07 on `feat/table-atlas`.

**Research / exploration** — thinking not yet promoted to normative spec.

- `FEATURE-PRIORITIZATION.md` (`type: build-plan`) — the readable answer to "what do we build, in
  what order, what's prototype vs MVP, how is each tested, and when is it declared arrived" —
  derived 2026-07-23 from the closed twelve-wave program (ladder/ledger/wave records stay
  authoritative); stages 0-7 + parked features with triggers. Authorizes no build (Q12-B gates).
- `PROCEDURAL-DUNGEON-DIRECTION.md` — the current discovery authority for rebuilding architectural
  and dressing rolls around a tile/slot room compiler; records accepted direction, unresolved forks,
  and the strict question-wave closure protocol. No implementation is authorized by this document.
- `BATTLEMAP-TOWNTRAY-COMPOSITION.md` (`type: design-study`) — accepted high-priority shared BattleMap/TownTray direction: current spatial/UV audit, `TacticalCompositionPlan`, region/connector/route/reservation passes, compact surface-frame art contract, C1H clay proof, corpus ladder, costs, and open specification decisions. No build authorization. (2026-07-22)
- `TRIM-SHEET-PIPELINE.md` (`type: design-study`) — accepted high-priority supporting direction for architectural trim sheets: existing strip/run audit, semantic manifest, deterministic source-strip packing, canonical-material-first variants, repeat-safe run UVs, geometry-profile boundary, fallbacks, costs, accepted C1I proof, and later profile/channel/material/shader promotions. No build authorization. (2026-07-22)
- `PROCEDURAL-DUNGEON-RESEARCH.md` — deep technical synthesis of procedural room layout, furnishing,
  playability constraints, and solver architecture, with direct implications for Genesis.
- `PROCEDURAL-DUNGEON-ENGINE-CROSSWALK.md` — audited map from the research model to the current
  dungeon graph, room grammar, walk, table, combat, and renderer seams.
- `../Reference/Procedural-Dungeon-Research/SOURCE-INDEX.md` — verified source ledger for the bundled
  nine-paper PDF corpus and the rendered research report.
- `../Reference/Prison-Custody-Study/` — Site 6 initial depth and culture/doctrine packet:
  authoritative architecture/operation/property sources, evidence/inference boundary,
  synthesis, selected `PR-DOC-01`/`PR-DOC-02` comparison, later doctrine candidates,
  and declared gaps that keep research `PARTIAL`. (2026-07-25)
- `../Reference/Tavern-Study/` — twelve deterministic live tavern-path receipts,
  current/unwired/archive audit, cross-tradition hospitality source ledger,
  `HospitalityVenueProfile` synthesis, and the superseded d300-gate proposal retained
  for untyped preservation and explicit adaptive reuse. Typed successor:
  `BUILDING-PROGRAM-TABLE-FAMILIES.md`. Research/implementation evidence only.
  (2026-07-26)
- `../Reference/Building-Type-Roll-Study/` — 42 deterministic integrated rolls
  covering all fourteen live building kits at three d300 bands, fourteen same-seed
  realm mirrors, and the actual Prison/Custody source boundary. Establishes the
  before-state: the layers stack mechanically but do not yet reconcile program,
  culture, people, or Spice like the walks. (2026-07-26)
- `../Reference/Building-Family-Table-Samples/` — seven small family-table taste
  tranches, including dedicated Prison/Custody, and 28 deterministic layered sample
  receipts across all fourteen live programs plus custody. Explicit arrangement/
  chassis eligibility prevents nonsense combinations; founder taste calls remain
  open before final d20 expansion. (2026-07-26)
- `../Reference/Golden-Site-Ideal-Art/prison/` — three rolled Site 6 ideal-art layouts:
  matched Keeper-House and Ledger-and-Shift four-cell civic jails plus a fresh
  deterministic reconstruction of the suspended living-ironwood cell, with seed/table
  lineage, adapter decisions, layout diagrams, asset anchors, and prompt notes.
  Visual direction only; no clay or runtime gate advancement. (2026-07-25)
- `../Reference/Golden-Site-World-Context/` — six complete current world-genesis
  replay-harness receipts plus the retained Prison composition reference. The audit
  seeds make the live unseeded roll order reproducible for study; they are not product
  world seeds. Supports Golden Site context/background projection. (2026-07-25)
- `EXTRUDED-SPRITE-PROP-LIBRARY.md` — production plan for the realm-specific prop bank: generated
  silhouettes/faces/motifs routed through EXTRUDE, FACED_BOX, or MODEL; compiler, registry, QA,
  no-human workflow, and ES-0 through ES-5 rollout. (2026-07-12)
- `PROCEDURAL-ASSET-KIT.md` — implemented engine-owned construction vocabulary: standardized
  mechanical parts, rope/chain paths, FX, cargo sockets and containers, signs/papers/banners/decals,
  forty connective parts, composable condition/access/occupancy recipes, regional material
  channels, interactive proof pages, and browser verification. (2026-07-27)
- `OFFLINE-ART-FOUNDRY-RESEARCH.md` — executable Kenney/OSS audit and the deterministic donor-parts
  grammar: 49-pack census, 13-pack shortlist, prop IR, geometry/texture gates, and OF-1–OF-6 plan.
- `FABLE-DEV-TOOLS.md` — rough future-tool queue: Table Atlas, NPC Library, Town Builder, and
  Building Builder as read-only authoring instruments first, source-safe editors later.
- `STARTING-STATE-MODELS.md` — starting-state design research.
- `GAP-ANALYSIS.md` — what persistence needs that the engine doesn't have yet.

**Operational** — process and running state.

- `HANDOFF.md` — read first in a new session; orients you and links the rest.
- `NEXT-STEPS.md` — the ordered build plan; "Do next" at the bottom.
- `REAUTHORING-SWEEP-PLAN.md` (`type: build-plan`) — the executable two-lane plan for the table re-authoring sweep: recontext primitives + SRD lenses + creature scrub + monster wiring, split into autonomous-safe (overnight) vs. propose-and-wait (destructive) lanes. Companion to `TABLE-REAUTHORING-PREP.md` (the per-table flavor brief).
- `CORPUS-INTENSITY-MAP.md` (`type: generated-map`) — **generated** by `build/corpus-intensity-map.py`: every table scored for spice ceiling (explosive headroom) + floor (copy-paste/ungraded). The navigation surface for the whole-corpus craft pass. Re-run after edits.
- `REAUTHORING-RUBRIC.md` (`type: rubric`) — the shared standard for the craft pass: the quality floor + the explosive ceiling, benched on the corpus's own best rows, with the per-table working loop. Read with the map.
- `CHANGELOG.md` — dated record of changes, newest first (newest 25 entries; older auto-archive to `CHANGELOG-ARCHIVE.md` via `build/archive-docs.py`).
- `CHANGELOG-ARCHIVE.md` (`type: changelog-archive`) — read-only overflow of older CHANGELOG entries; the two files read as one continuous history.
- `SCALING.md` — the architecture/scaling audit + the "when to migrate" answer.

**Audit / scan**

- `GENERICIZATION-SCAN.md` — the IP-scrub record.
- `WIRING-MAP.md` — what's connected, what's waiting, what collides — synthesized from a 3-scout deep scan (2026-07-02).
- `TABLE-USAGE-AUDIT.md` — generated snapshot: every compiled table → source file → what triggers it (Oracle-only vs wired). Regenerate with `build/gen-table-usage-audit.py`.

**Vision** (`type: vision`) — dreaming beyond the roadmap; a bearing, not a build queue.

- `DREAM-HORIZON.md` — the far roadmap beyond DESIGN-GUIDE T0–T7 — a bearing, not a build queue; dreamed with Adam (2026-07-02).

**Operational / batch notes** — process governance for the multi-unit overnight/batch builds: guardrail rulings, plans of record, review verdicts, risk/parking ledgers, doctrine. Distinct from the **Operational** heading above (which holds the running-state docs read every session).

- `ADAM-REVIEW-1.md` — Adam's first PROVISIONAL-table review pass + the Place-Drift mechanization scan; BINDING inputs to batch 3 (2026-07-02).
- `ATTRIBUTION.md` — the consolidated attribution record (batch-3 unit 13, forever-guards; 2026-07-02).
- `BATCH-GUARDRAILS.md` — binding rulings closing every latent decision in the seven overnight-batch specs (2026-07-01).
- `BATCH2-GUARDRAILS.md` — binding addendum to the batch-2 units, same contract as BATCH-GUARDRAILS (2026-07-01).
- `BATCH3-GUARDRAILS.md` — binding addendum to the 14 batch-3 units, the rubric pass (2026-07-02).
- `BATCH3-PLAN.md` — batch 3's plan of record, staged after batch 2's merge (2026-07-02).
- `DECK-CLEARING-FINDINGS.md` — dedup evidence + the corrected consolidation plan; awaiting review (2026-06-28).
- `PARKING.md` — one line per idea — the freeze's holding pen; standing (2026-07-02).
- `PROBE-PROMPTS.md` — the copy-paste sheet for Adam's next ChatGPT image session (§II.0a probe + Blockwright); ready (2026-07-01).
- `RISK-REGISTER.md` — the honest risk assessment, Adam-requested; standing, re-scored at every clean close (2026-07-02).
- `SPEED-DOCTRINE.md` — the AI does only what only AI can do — binding doctrine on every future spec; locked (2026-07-02).
- `SPICE-RULER.md` — the entry bar per spice band — calibration extending SPICE-CURVE; draft awaiting Adam's blessing (2026-07-02).
