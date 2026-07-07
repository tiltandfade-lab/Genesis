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

## Genres (the `type:` frontmatter taxonomy)

**North star** (`type: design-guide`) — the dream, the look, and the ordered path; sits *above* the decision registry.

- `DESIGN-GUIDE.md` — the pillars, the visual bible, the T0–T7 roadmap. When it and `DESIGN.md` disagree, fix the drift in the same change. (2026-07-01)
- `DIRECTION.md` — the standing directorial trajectory (2026-07-03 reshape): the playability gate, renderer decency-gate-then-freeze, soak-before-build, the batched Adam ledger, the v1 ship-gate. Supersedes NEXT-STEPS ordering where they disagree. (2026-07-03)

**Decision log** — the registry of locked calls; the index of decisions, detail lives in the specs.

- `DESIGN.md` — every locked decision in a dated table. **Start here.**

**System specs** (`type: system-spec`) — normative "this is how the subsystem works." The buildable contracts.

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
- `ASSET-PROMPTS.md` — *(working-doc)* the T1 image-generation shopping list for Adam's image-gen sessions: style-lock prompt + per-asset specs (title wordmark, scene plaque, medallions, seamless textures, icon gaps, battle-theater advance-buys). (2026-07-01)
- `ADVANCEMENT-RETUNE.md` — the advancement spec's structure-locked, numbers-provisional retune (2026-07-01); framework now, telemetry-tuned numbers from play.
- `AUTOMATED-PLAYTEST.md` — the Layer-1 automated-playtest loop (AI player × real DM stack); run parameters locked 2026-07-03.
- `BATTLE-THEATER.md` — the FFT-grammar three.js battle stage — low-poly 3D, PSX grit, T1 build-ready, T2 gated on pack download (2026-07-03).
- `BATTLE-VISUALS.md` — making the fight worth looking at — Phase A build-ready, Phase B is the style-probe session, Phase C is T6 (2026-07-03).
- `BATTLEMAP.md` — the 12-zone battlemap: spoken moves, an honest diorama; structure build-ready, art awaits the STYLE-PROBES verdict (2026-07-01).
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
- `SPRITE-SHEETS.md` — creature sprite generation + slicing pipeline; PARKED 2026-07-03 in favor of the 3D low-poly model grammar.
- `SRD-MECHANIZATION.md` — closing the last d20 gaps — check spine, conditions, concentration, combat actions, death saves, exhaustion; built (2026-07-01).
- `STYLE-PROBES.md` — settling the §II.0a visual-style gate with one hybrid probe; specced (2026-07-01).
- `SYNTHESIS-CONTRACT.md` — the Synthesis-Pass Contract — how rolled atoms become prose; draft (2026-06-23).
- `TABLE-EDIT-SAFETY.md` — hand-editing the Engine table corpus without cascading bugs; locked (2026-07-03).
- `TABLE-GAPS-070126.md` — the tables the new systems now want — five new tables + thin-expansion unit; specced (2026-07-01).
- `TAROT-SESSION.md` — the Session Draw — tarot as the session's mutator; Majors samples await review, minors build-ready (2026-07-01).
- `TIYL-DEEPENING.md` — This Is Your Life — deepening (names · presentation · the prep bridge); build-ready (2026-07-01).
- `TIYL-UI-PORT.md` — the bardo leaves the centered-card era — TIYL ported to full-bleed UI; Sonnet-executable (2026-07-03).
- `TRAVEL-WALKS.md` — the journey IS a walk — travel consumes the walk roller; build-ready (2026-07-01).
- `URBAN-FABRIC.md` — typed buildings, lazy districts, the tavern as a surface; specced, batch-3 unit 9 (2026-07-02).
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
- `CHANGELOG.md` — dated record of changes, newest first.
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
