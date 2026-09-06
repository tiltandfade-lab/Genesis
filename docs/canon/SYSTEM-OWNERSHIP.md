---
type: canon
status: ACTIVE — the authority map: which system owns which facts
created: 2026-07-22
updated: 2026-08-04
owner: docs/canon/README.md (precedence law)
---

# System Ownership — who owns which truth

The one law under everything: **every fact has exactly one owner; everything else is a
projection.** (Wave 2 P2.12; `docs/DESIGN.md` anti-drift north star.) This map names the owners —
both the systems that exist in code today and the accepted design-level owners the waves have
ruled — and names the parallel authorities that are explicitly forbidden.

Two columns of truth run through this file and must never be conflated:

- **BUILT** — the owner exists in code now (`docs/ARCHITECTURE.md` is the detailed map; census
  class `implementation-evidence`).
- **ACCEPTED** — the owner is design-accepted by a closed wave but unbuilt (the Feature-Promotion
  Ledger tracks its proof/MVP/goal path). Accepted owners do not retire built owners until Wave
  12 authorizes a cutover with replacement proof.

## 1. Canonical state owners (BUILT)

| Fact family | Owner | Notes |
|---|---|---|
| Persistent universe / worlds | `U` + `world.state` accessor layer | "the world is the save file" |
| All transient mutable state | `GS` (src/state.js) | new mutable state goes here, nowhere else |
| Change-over-time (clock, canon facts, spatial facts, faction clocks, drift, spicy outcomes) | World State Ledger | the single home — no second history |
| Entities (NPC/place/item/faction records + links) | `w.codex` | written only via `codex_*` events |
| World geometry | node-graph (cognition) + lazy hex substrate (never stored, never in AI context) | `docs/SPATIAL-MODEL.md` |
| Combat state (current) | combat resolver, `GS.combat` — 12-zone band/lane model | exact-cell successor ACCEPTED (below) |
| Rules data (tables, items, spells, progression, bestiary) | Engine markdown + build/gen-*.py → generated `data/*.js`, `tables.js` | edit-source → compile-artifact; artifacts never hand-edited |
| Module registry | `manifest.json` + check-manifest.py | the code spine |
| DM↔engine interface | `EVENT-CONTRACT` typed events; payload repair ONCE in `dmFoldPayload`/`DM_EVENT_FIELDS` | never per-handler coercion |
| Execution/adjudication route | `dmRoute` (`local-fact` / `declared-mechanic` / `freeform-ruling`) + engine-owned `mechanical-receipt/v1`; `dmTriage` separately owns only the model-quality floor | unknown/contextual free text remains open; built pre-resolution proofs are exact rest and trusted id-addressed item transfer |
| DM turn-context projection | `world.dm-digest` derives sparse `beat-digest/v1` from full `dmDigest()` truth; `dmRoute` remains execution authority | five views; 3 KiB ordinary target; named off-scene Codex retrieval; omission is not falsehood |
| Portable-item physical custody | character inventory or `corpse.items` for native owners; `w.itemCustody` (`world.item-custody`) for NPC/creature/faction/container/place/object holders; `r.legacy` remains the significance/recovery overlay | one physical owner per instance id; whole transfers preserve id, partial transfers preserve remainder id; current-scene digest is a projection only |
| DM transport (dev) | DM bridge mailbox (`dev/dm-bridge.py`, `src/world/dm.js`) | dumb mailbox; app applies events with its own mutators |

## 2. Accepted design-level owners (ACCEPTED, unbuilt)

| Fact family | Accepted owner | Ruled in |
|---|---|---|
| Procedural vignette orchestration and synthesis order | one `ProceduralVignetteSynthesizer` compiling `VignetteRequest` through semantic/window/spatial/tactical/surface/asset plans; terrain and construction are stages, never separate engines | `GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md` |
| Semantic identity versus exact face/material demand | semantic plan owns `SemanticIdentityReservation`; `SurfaceAssemblyPlan` owns real faces/local frames; asset plan derives `SurfaceMaterialDemand` only after the face exists | `GOLDEN-SITE-VIGNETTE-CONTRACTS.md` §4.1; `GOLDEN-VIGNETTE-VISUAL-GUIDE.md` §4 |
| Visual review standard | founder law in `ART-DIRECTION-CANON.md`, routed through `GOLDEN-VIGNETTE-VISUAL-GUIDE.md`; hard/soft/provisional machine rubric is a verifier input, not taste authority | founder ruling 2026-07-29 |
| Visual asset factory envelope | Assetforge owns typed manifests, quarantine, specialist-tool orchestration, proofs, receipts, and explicit admission; specialist material/palette/trim/registry/persistence engines retain their algorithms | `ASSETFORGE.md`; Golden application ledger |
| Site identity, host semantics, transforms, and active extent | persistent `SiteIdentity` + host `RoomProgram`/operating-model obligations + ordered `TransformStack` + bounded `MaterializationWindow` | Waves 1-2; `GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` reconciliation |
| Spatial legality (cells, volumes, elevation, boundaries, zones, provenance) | `SpatialPlanV2` via the staged pipeline SpatialIntent → legality → `TacticalCompositionPlan` → `SurfaceAssemblyPlan` | Wave 3 P3.5 |
| Connections, portals, secrets, vertical traversal, circulation | canonical `Connection` objects + traversal transactions + Secret Networks | Wave 4 (single subject authority) |
| Furnishing, dressing, containers, touched state | hierarchical assemblies + tiered container truth + touched-dressing assertions | Wave 5 |
| Bodies, capacity, participation, cast projection | `BodyForm` + typed activity-capacity envelopes + typed participation roles + player-contact `CastRoster` + Stub/Working/Developed ladder | Wave 6 |
| Scene identity across modes | `SceneTray` contract + typed adapters + transactional `SceneLineage` handoffs | Wave 10 |
| Exact tactical truth (future combat authority) | exact `SpatialPlan` cells on the BattleMat; zones/bands demote to derived fallback at cutover | Wave 10 §11.6-11.7 (F10.1e) |
| Combat performance | EngagementLens — derived, receipt-consuming only | Wave 10 |
| Promoted scene facts / DM invention | `SceneFactGraph` (index/transaction surface) + C0-C4 creation matrix + REPLAY/DERIVE/ROLL/PROPOSE/SYNTHESIZE lanes + P0-P4 precedent lifecycle | Wave 2 G2.1 |
| Multi-actor crises | `CrisisChain` — thin orchestration graph over existing owners | Wave 2 G2.2 |
| Crit resolution | `CheckContract` → `CritMandate` → `CritCascadePlan` → `ResolutionReceipt`; `TerminalDisposition` | Wave 2 §10.11.27-50 |
| Land travel | one shared TravelWalk/SceneLineage contract; Fray/Spice authority reused, never duplicated | Wave 10 F10.9g |
| Towns | bounded district graph + mounted real-roll venue grids | Wave 10 F10.9h |
| Sparse persistence structure | one sparse canonical record per noun; typed refs; receipts; content-addressed dedup; separate narration; chunked persistence; scoped retrieval (codec = Wave 12) | Wave 6 §15.6 |
| Current presentation disposition | Story is default; Sprites and Theater Lab are optional projections over identical canonical events/state | `TEXT-FIRST-WALK-RESTORATION.md` |
| Walk focus/lifecycle | per-walk cursor/state persists; `activeWalkId` is digest focus; focus changes suspend rather than close | `TEXT-FIRST-WALK-RESTORATION.md` §2.2 |

## 3. Presentation and provider boundaries

- **Projections own no facts.** BattleMat, EngagementLens, cards, maps, text views, audio, and DM
  prose consume committed receipts. "The renderer never becomes the source of a fact"
  (FOUNDATION §3). Renderer memory holds no gameplay state (Wave 10 P10.2).
- **The DM (any provider) owns verbs and meaning, never nouns or numbers.** This includes intent,
  rule applicability, check/DC/advantage/stakes, exceptions, acting, and interpretation for novel
  fiction. The engine rolls atoms, executes applicable rule math, and owns every number; the DM
  interprets, narrates, connects, and — inside the earned
  SYNTHESIZE envelope — authors identity/meaning that the engine compiles, validates, and
  persists. "No consequential noun may exist only in prose" (Wave 2 G2.1.5).
- **A keyword is never execution authority.** Exact factual display requests may be local; a
  declared mechanic may resolve first only after it has a complete resolver, immutable receipt,
  and false-positive proof. Every other utterance defaults to open DM adjudication. Quality routing
  (`dmTriage`) cannot change this ownership split. (`DESIGN.md` 2026-08-04.)
- **Provider input is proposals.** Propose → validate → commit/reject → narrate. An engine-
  rejected event is never narrated as having happened (Wave 2 §10.11.25). AI-authored executable
  code and prose-as-rules are forbidden (G2.1 compile law).
- **The DM seat is provider-neutral.** One digest/tool/refusal contract for every supported
  model; per-provider behavior differences may not alter world/mechanics outcomes (Wave 10
  §11.83; `docs/SEAT-ADAPTER.md`).
- **Context scope owns no truth.** A beat view may omit irrelevant canonical state but may not
  redefine it. The full digest/store remains authoritative, and named references are retrieved
  deterministically before a call (`DESIGN.md` 2026-08-04; `world.dm-digest`).
- **Recovery** replays no mechanics: canonical receipt cursor + terminal-state rebuild + recap
  (Wave 10 F10.8c; C1F).

## 4. Forbidden parallel authorities (name the collision, refuse it)

1. **A second combat resolver.** EngagementLens, lens animation, or any view deciding movement/
   reach/cover/LOS/damage. (Wave 10)
2. **A second geometry generator for towns.** TownTray forks BattleMap's composition/surface
   authority. (Wave 10 §11.90; ledger row "Shared procedural BattleMap/TownTray composition")
3. **A second Fray/Spice curve** for travel, biomes, or anything else. Consumers tune separately;
   the authority is single. (Wave 10 F10.9g; C2I)
4. **A duplicate person/object store.** CastRoster or SceneFactGraph holding copies instead of
   references. (Waves 2/6)
5. **Narration as state.** Transcripts/prose as recovery authority or a second history. (Wave 6
   §15.6; ledger)
6. **Renderer-physics adjudication.** Physics/visuals deciding whether an action succeeded; TTRPG
   action/DC resolution commits, renderer consumes. (Wave 3 P3.10 correction; Wave 6 P6.3)
7. **Hand-edited generated artifacts.** `tables.js`, `data/*.js`, `dm-contract.json`,
   `table-registry.md`, gauntlet reports — regenerate from source, never edit or hand-merge.
   (CLAUDE.md)
8. **Per-handler payload repair.** Normalization lives once at the contract boundary. (CLAUDE.md)
9. **A second decision registry.** `docs/DESIGN.md` remains the chronological locked-decision
   registry; [DECISION-INDEX.md](DECISION-INDEX.md) is its stable-id index, not a rival. Wave
   records remain the semantic authority for their subjects; canon files route, they do not
   re-decide.
10. **Reactive difficulty scaling.** No system silently rescales because the player found a tool,
    tactic, or cache. (Wave 1 §8.11; Wave 2 G2.1 counter law; `docs/DIFFICULTY.md`)
11. **Golden number as runtime site authority.** The twelve Golden Sites are the
    acceptance portfolio, not a mutually exclusive site enum. Ordinary host/venue
    programs and cross-host transforms compose through the shared semantic/spatial
    path. (`docs/GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md`)
12. **Separate terrain and building/site engines.** Natural substrate formation and
    constructed host realization share one request, macro plan, support/elevation
    field, tactical reservations, asset resolver, receipt, and projection pipeline.
    They may be separate compiler stages or modules, never rival generators.
    (`docs/GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md`)
13. **A second visual/material algorithm hidden inside Assetforge.** Assetforge is the
    primary production envelope, not a replacement author for Material Maker, ground
    materials, palette harmonization, trim/decal, sprite registry/citizenship,
    projection, persistence, or the synthesizer. It wraps the canonical specialist,
    binds exact inputs/outputs, proves, and receipts. (`docs/ASSETFORGE.md`)

## 5. Cutover law

Where an ACCEPTED owner will replace a BUILT one (12-zone combat → exact cells; per-room door
rolls → Connection records; current dungeon d200 → decomposed rollers + recipes; localStorage
serialization → chunked persistence), the built system **keeps running and keeps its census
protection** until Wave 12 authorizes the specific cutover with replacement proof (golden-beat
preservation law, Wave 1 §8.11; PHASING-FRAMEWORK law 9: "the MVP floor is not a removal list").
The general IMPLEMENTATION-HOLD still protects unscoped cutovers. The passed Golden gates and
their evidence remain preserved, but Adam's 2026-08-03 ruling suspends that program as the active
implementation route. `TEXT-FIRST-WALK-RESTORATION.md` authorizes only its reversible slices;
nothing here authorizes deletion of the visual stack or an unrelated accepted-owner cutover.
