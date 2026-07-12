---
type: next-steps
branch: Genesis
status: living
created: 2026-06-18
updated: 2026-06-19
related:
  - "[[DESIGN]]"
  - "[[GAP-ANALYSIS]]"
  - "[[SPICE-CURVE]]"
---

# Genesis — Next Steps (ordered, living)

The running execution order. `DESIGN.md` holds the *what* and *why*; this holds the *in what order*. Update in the same change as progress. Status: ☐ todo · ◐ in progress · ☑ done.

**Auto-archive rule (2026-07-09):** at most 4 dated `## Do next (...)` blocks live here; older ones
roll into `NEXT-STEPS-ARCHIVE.md` via `python3 build/archive-docs.py --emit`. Standing plan
sections (tracks/layers/etc.) are never auto-archived.

## Do next (2026-07-12 — GRAPHICS-NORTH-STAR: Stage A CLOSED; walk-native boundary landed)

Codex's A→B graphics program (`docs/GRAPHICS-NORTH-STAR.md`) — **Stage A is BUILT** (master `00b775f8`,
CHANGELOG 2026-07-12). The composed camera is live: the interior composes on the action cluster + occludes
dynamically, fed through Codex's walk-native anti-drift boundary (`walkSceneFrom`). Sequenced by Adam's
ruling: build the boundary first (WDV-1/2), then wire A3, then A4.

1. ☑ **WDV-1 `walkSceneFrom`** — the walk-native boundary (`src/engine/walk-scene.js`); `board.walkScene`. 32/0.
2. ☑ **WDV-2 stamped provenance** — `walkPickStamped` + `segment.rollRefs`, byte-additive. 34/0.
3. ☑ **A3 shot-compose** — ShotPlan wired, composed camera live, WalkScene-fed. 29/0. (Round-1 framing
   regression caught at the capture gate + corrected.)
4. ☑ **A4 dynamic occlusion v2** — live `ShotPlan.occlusionTargets`, per-instance ghost fade + hysteresis.
5. ☐ **Adam eyeballs the Stage-A frames** (`dev/battle-gate/shot-compose/after-composed.png`, the A4
   on/off, the loop contact sheet); dial the named consts if wanted.
6. ☐ **Stage B — sprite citizenship** is the next graphics wave (the §4.5 standee contract: footX/Y,
   worldHeight, plinth/contact-shadow/explicit shader, in-engine acceptance gallery). Then C (polygon
   rooms — the shell compiler is landed) / D (stateful nouns) / E (material+light finish).
7. ☐ **Codex's remaining walk-native units** (deferred, his recommendation): WDV-3 table visual metadata,
   WDV-4 overlay/state key unification, WDV-5 cross-env diorama gate.
8. ☐ Follow-up: the two pre-existing render-only reds (occlusion ghost bloom/AO pixel check; bw2-1b
   doorframe over-occlusion) — render-only, auto-skip in CI.

## Do next (2026-07-11 — VISUAL CAMPAIGN CONTINUATION: BW4 → BW5, registered)

BW2/BW3 landed (CHANGELOG); the campaign continues with two waves, in order. Build unauthorized until
Adam says go — BW4 lands first.

1. ☐ **BW4 — MOTION & FEEL** (`docs/BEAUTY-WAVE-4.md`, SPECCED). Runs FIRST — pure motion mechanism on
   the already-wired tween channels: camera tweens (MF-1) · spawn/despawn grace (MF-2) · hit-stop
   (MF-3) · turn/round rhythm (MF-4) · the feel gate (MF-5). Independent of BW5; MF-2's room crossfade
   is exactly what BW5's one-room render rides.
2. ☐ **BW5 — THE SECOND INTEGRATION PASS** (`docs/BEAUTY-WAVE-5.md`, SPECCED + registered in DESIGN).
   Close the roll→render gap. Order: **SEAM 0** (the stage — one-room render + occlusion-fade + the
   broad state primitive + the prop construction model; detail in GRAPHICS-ENGINE §H/§I, DUNGEON-GRAPH
   Law 7/U6) → **SEAM 1** (interactables; the DOORS-FIRST keystone slice proves the whole stack) →
   **SEAM 2** (rooms) ∥ **SEAM 3** (materials/conditions). **CORE-3 scope** (fantasy/gloom/chrome);
   other realms parked as expansion.
   - **Adam (ImageGen):** the core-3 execute packets — PACKET-07 core-variants · 05 condition-decals ·
     06 arch-materials · 08 furniture-faces (+ PACKET-04 cross-usable subset). Index:
     `dev/model-qa/mock-gen/PACKET-WAVES.md`. Wiring these needs the one-time code touches each packet's
     "Return handling" lists (fold-textures slice path, REALM_TEXTURES appends, CONDITION_DECALS +
     ARCH_MATERIAL_TEXTURES lookups) — BW5 SEAM 3 build units.
   - **Build-time details left thin on purpose** (settle when their unit builds): S0-3 state-primitive
     schema · IA-2 cache home in `world.state`.

## Open threads — carried forward (STANDING section; never auto-archived)

Live work that currently lives inside dated `## Do next` blocks and would be LOST when those blocks
hit the 4-block archive cap (`build/archive-docs.py` rolls the oldest dated block; the 2026-07-09
block is next). Consolidated here so it survives the roll. Loot / Track B / starting-state /
change-over-time items already sit in their own standing sections below — safe, not repeated here.
When a thread lands, tick it here; when a whole lane is folded into a newer spec, say so and point.

**The Sonnet-ready spec build wave** — each is SPEC-not-locked; **lock its open rulings before
executing** (as ANIMAL-SOCIAL was). ANIMAL-SOCIAL + PLACE-GEN already LANDED. In dependency order:
`TIYL-WEIGHTED-STARTS → HOOK-WALKS` (dungeon-discovery · breach-in-walks · mid-walk entry · 8–12
segment law; `hookWalkMint` not built) `→ GLOOM-KEY U1–U7 → CAMEO-CAST U1–U5 → SHIP-TRAVEL U1–U9 →
REALM-HOOKS U1–U6`.

**Adam's hands (content / taste):**
- ☐ **Gather the books** into `Reference/` (Saltmarsh treatment, highest-fit first): Van Richten's→GLOOM ·
  Tomb of Annihilation→LOST-WORLD · Wild Beyond the Witchlight→BRIGHT-KINGDOM · Curse of Strahd→COSMIC ·
  Explorer's Guide to Wildemount→TIYL · Descent into Avernus→CHROME · Acquisitions Inc→economy ·
  Rime of the Frostmaiden→wilderness.
- ☐ **Row-level taste passes** on PROVISIONAL craft: Child Saw d100 · the 3 item tables · the 3 realm re-keys.
- ☐ **Place-gen riders:** PLACE-ASSET-QUEUE red-pen (the spend gate) · Place Spine + 3 skin labels + 5
  settlement tables craft pass · interior-gen spec section (DMG14 App-A + Bastion bands, realm-skinned) ·
  8 backfill realm skins · HOOK-WALKS terminus-bias table when that spec locks.

**Models lane (other session):** saurian warrior+scholar castes · 2–3 rideable dino mounts · Zeal
sentinel · bat gang · ED-209-class boss · ally-mutant · Shoggoth "Unformed of Nun" re-identity (deferred).

**Sprite lane (SPRITE-GEN-V2):** round-2/3 gen remainder · registry fold-in (v3-sizing/v3-tags →
`data/sprite-registry.js`) · NPC expression pass (after Adam settles assignments) · **land the sprite
lane** (`claude/sprite-gen-refactor-magenta`, 23 commits + parked sheets) at the gen-wave sweep · XL/titan
regen (64 sheets, `XL-REGEN-PROMPTS.md`) · fantasy review pass (486 unreviewed, `sprite-review.py` :5179) ·
item-kind rider (571 item cells skipped by the v2 parser).

**Dungeon-graph / render lane:** re-shoot the U3 study card (fog near-black, gloom underexposed, toast
bleed) → Adam taste gate · **the finale gate** (roll a dungeon walk → render a battle in a generated
room at true scale → loop-test the cycle) · GUISE G1–G4 + NPC expression.

**Visual-campaign follow-ons** (most now folds into BW4/BW5 — see those docs): eyeball the beauty shots +
the r2 ΔE-flag list (42 sprites, `unification-report.json`) · UNIFICATION-WAVE UW1–UW4 (after the mocks) ·
Blender teaching session (Adam upskilling to direct modeling). **SUPERSEDED:** BEAT FRAMING / camera law 2c
is now folded into BW5 (GRAPHICS-ENGINE §I: occlusion-fade + one-room orbit camera).

**⚠ GIT-LFS MIGRATION — URGENT** (`docs/GIT-LFS-MIGRATION.md`): GitHub warns on the two 79MB zips; needs
Adam's $5 pack + a force-push confirm; do at a quiet post-merge moment.

**Standing:** playtest + retune (E-PRES curves, hook-walk lengths, ship lethality — all felt-in-play);
the NPC-lane optional craft (kin rows fold-in).

## Design lock — ☑ done (2026-06-18)
Spice = emergent · Fragment oracle = default · AI DM narrates · visible transition-based clock · World State Ledger = all change-over-time · primitive node-graph map. All recorded in `DESIGN.md` Locked decisions (2026-06-18).

---

## Two tracks run in parallel, then converge

### Track A — The World Spine (in `genesis.html`) — ☑ DONE 2026-06-18
The persistent skeleton. Self-contained; needs no table pipeline. Built + verified (29/29 headless checks).

1. ☑ **World State Ledger** — one append-only store (`world.ledger`) for all change-over-time. Entry types live: `canon` (write-once facts), `transition` (time jumps), `spatial` (routes), `session`; reserved/wired-for: `clock`, `drift`, `npc-life`, `outcome`. Never silently rewritten. Rendered as a "World State Ledger" section.
2. ☑ **Visible clock + transitions** — in-world day/time HUD (`Day D · HH:MM · time-of-day`) + session counter in the world header. "Begin a new session" increments the counter (no time move); travel / short rest / rest-until-dawn / montage write `transition` entries that advance the clock. Scenes don't tick.
3. ☑ **Node-graph map skeleton** — places = nodes, traveled routes = weighted edges (rolled bearing + travel-time + rough leagues), stored as `spatial` canon. `addEdge` is write-once (never re-rolls an established route; paradox licensing deferred to high-spice). Primitive SVG render included (circular layout, current node highlighted). "Travel to a new place" now creates a node+edge and advances the clock by travel-time.

**Built also:** additive `migrateWorld`/`migrateAll` upgrades legacy `genesis-universe-v2` saves on load (adds ledger/clock/session/map/currentNodeId, seeds nodes from the existing gazetteer) — idempotent, no data loss. `handToDM` now includes in-world time, current location, and recent transitions/routes.

**Deferred (gotcha):** the old narrative `world.log` (Chronicle) and the new `world.ledger` are parallel stores — state-changes write a structured ledger entry *and* a prose chronicle line. A later step should render the Chronicle *from* the ledger to collapse them into one. Tracked here so it doesn't drift.

### Track B — The Content Pipeline (tables → game) — *now framed as the compile step*
Gets the 270 tables into Genesis cleanly. The highest-leverage non-build prep. **Architecture (locked 2026-06-18, see DESIGN):** markdown tables = editable source; compiled JSON = generated artifact the engine runs. The node parser (step 5) *is* the compiler. Build rules: never hand-edit compiled JSON; compiler stamps source+hash+timestamp; compile **validates** all cross-references (tables point at spells/items by name → resolved against `SRD-Data/`) and emits a referenced-vs-orphaned coverage report. Engine does the mechanical rolling/state; AI does only DM interpretation.

4. ☑ **Tables are machine-indexable — DONE 2026-06-19.** Lean YAML frontmatter stamped across all **754** files (`Engine/03._Tables` + `Asset Library`): `id` (pinned `^anchor`) · `type` (table/table-set/name-bank/creature/adventure/encounter/faction/manual/stub) · `domain` · `status` · and on tables `table_class` (Spark/Fork/Commitment) · `player_facing` (reveal/plumbing) · `voice_critical`. **Lean by decision:** `die`/`rows`/`spice` are NOT stored — the parser (step 5) derives + validates them from the body, so nothing drifts. Enforcer `Engine/00. _System/stamp-frontmatter.py` (idempotent/additive/body-safe), schema + new-table template `Engine/01. _Templates/_Table Frontmatter Schema.md`, judgment-field review list `outputs/stamp_review.csv`. *(Note: die/rows/spice intentionally dropped from the earlier field list — derived, not stored.)*
5. ☑ **Parser → `tables.json` — DONE 2026-06-19.** Built `Engine/00. _System/compile-tables.py` (Python; report-first, non-destructive — reads markdown, writes only `tables.json`). Reads frontmatter + splits per-table blocks (incl. table-sets by sub-heading), **normalizes en/em dashes**, derives `die` from the ranges, extracts the Band column, and emits rows as `[lo,hi,band,text,fragment-slot]` with per-table `{die,class,player_facing,voice_critical,domain}`. **Asserts full die coverage** and categorizes failures (real gap/overlap · starts-high · special · lookup-matrix) instead of just erroring. **Dice-aware (Adam's catch 2026-06-19):** reads a `(NdM)` / `(d12 + d8)` declaration from each table heading and honours it *only if* its min..max matches the rows (so a "2d4 items" quantity note can't mislabel a flat d100); records `dice`+`bell` per table so the engine rolls bell curves correctly instead of flat. **Final run: 344 dice tables, 327 clean, 2 confirmed bell (trinket=2d20, urban-encounters=d12+d8), 0 real coverage bugs**; only 2 flags left — `region-encounter` (genuinely malformed: missing header row eats row 1) + `birth-order-spark` (packed multi-column, parser false-positive); 15 special (lore/modifier, skipped), 7 lookup matrices (budget/threat). 00-notation d100 tables handled. Emitted `tables.json` (328 tables) to the Genesis root. **Still inline:** `genesis.html` does NOT yet read `tables.json` — wiring the game off inline data onto the compiled artifact is the remaining hook.
6. ☐ **Fragment batch** — generate the 6–10 word fragments for the tables Genesis actually fires. A/B Haiku vs Sonnet on one 30-row table first; route by `voice-critical`. One-time, sub-$1–single-digit cost.
7. ☐ **On-demand loading** — the game pulls only the rolled table into context (cost + the 100-roll fan-out).

#### Reference data (SRD-Data) — storage ☑ built 2026-06-18, retrieval layer ☐ pending
The rules-lookup companion to the generators: `Reference/SRD-Data/` now holds the full SRD 5.2.1 as queryable JSON (339 spells, 155 glossary / 15 conditions, 258 magic items, 38 weapons + 13 armor) plus faithful markdown for core rules / classes / origins. **Keep this separate from the generator tables** — different access patterns: reference = keyed random access (name → one record, or filter by constraint; you never *roll* a spell), generators = weighted sampling + roll-chains. One schema would hurt both.

**Principle for the in-app DM (applies to BOTH layers):** the lever for speed + reliability is the **retrieval layer**, not the file format. JSON is the right serve-from format (parse once → index → O(1) lookup / O(1) weighted sample; markdown is the *author-in* format, re-parsed at runtime). But a 366 KB spells file can't go into context wholesale — the DM needs a "fetch one record by key" step, the same shape as the Fragment oracle pulling the real row. So when Track B builds `tables.json` + on-demand loading for generators, give SRD-Data the parallel treatment: a name→record index + fetch-on-demand, not bulk-load. Caveat: JSON fails *silently* on a bad field where markdown stays legible — re-validate counts/fields on every regeneration (the build pass did; the parsers are session-scratch, re-derive from the PDF).

### Convergence — Presentation layer (needs A + B)
8. ☐ **Fragment + reveal/plumbing pacing** — player rolls surface one fragment; plumbing sub-rolls auto-resolve; AI DM weaves the result.
9. ☐ **Spice band migration + juice** — migrate the tier column to the 5-band ladder + table-class; wire the per-band exclamations + animations (Strange/Volatile/Mythic). Spicy outcomes write `outcome` entries to the ledger.

---

## Then — Change-over-time layer (needs the ledger + clock)
10. ☐ **Reincorporation oracle** — resurface established gazetteer/ledger elements so the world echoes its own history.
11. ☐ **Faction clocks / agendas** — factions advance goals across in-world time.
12. ☐ **World drift between visits** — "what changed here since I left," keyed to in-world elapsed time. *(Your persistent-mutator vision — alien invasion / generational outbreak — is a special, high-spice case of drift.)*
13. ☐ **NPC life-events + relationships** — recurring NPCs who move / rise / fall / die.

## Starting-State layer (the PC↔world bridge — research done 2026-06-19)
Closes the gap that char-genesis seeds only ~1 past-tense NPC and world-genesis doesn't roll the pressures **inside** or **outside** the town. Build-ready design + reusable-prior-art digest in **`STARTING-STATE-MODELS.md`**. Its content *is* the change-over-time layer's content (factions with clocks = drift).
- S1. ◐ **Faction Agenda & Clock** — tables authored 2026-06-19 (`Starting State - Factions.md`: Agenda/Method/Tags/Relationship; 1 dominant + 1d2 rivals). ☐ wire into world-genesis + clocks.
- S2. ◐ **Internal + External Pressure fronts** (Adam's named gap) — tables authored 2026-06-19 (`Starting State - Pressures.md`: Source/Internal/External/Impersonal/Grim Portent/Impending Doom; internal Grounded→Volatile, external →Mythic). ☐ wire fronts + clocks.
- S3. ◐ **Entry / opening bundle** at `cgBind` — tables authored (`Starting State - Entry.md`); the 5-slot bundle is procedure-assembled (PC seeds → factions → pressures → fresh). ☐ wire into `cgBind` + anchor promoted NPCs.
- **Procedure authored:** `Starting State Procedure v1.0.md` (counts, clocks, source weighting, reincorporation order, reactive PC-choice dimension, player intensity override, ledger writes). Decisions + lint (13/13 tables clean) logged in `STARTING-STATE-MODELS.md`.
- **WIRED into `genesis.html` 2026-06-19 (verified 21/21 headless):** SS tables mirrored to inline data (`SS`); `bindWorld` rolls the faction web (1 dominant + 1d3 rivals) + one Internal + one External pressure, concretizes Strange+ behind the screen, writes all to the Ledger as fronts/clocks; `cgBind` fires the Entry rolls; **montage** ticks a Faction Turn + drifts a pressure clock; the world view gained a **Powers & Pressures** section; `handToDM` carries the powers + the DM-only concretization/doom. **Still deferred:** per-row Fragments (the player sees the row text until the Fragment batch runs); clock-render polish; full Faction-Turn effects (splinter→new node, merge) are logged but not yet mutating the faction list.
- License: Ironsworn/Starforged CC-BY (reusable w/ attribution); DW Fronts open; WWN/SWN/ToAD/Solo-Toolbox study-only.

## Loot system overhaul (decided 2026-06-18: structural reconcile + party-level otherworldly banding)
Trigger: 258 new SRD items aren't in any loot table, and the system has **three non-agreeing entry points** (Dungeon Loot Tier / Composition / Budget) on **two rarity axes** (flavor-tiers vs D&D rarity). Otherworldly (`Dungeon Loot - Outlandish`, d300) is flat/unbanded — root of the "only scales to ~L8" pain. **These are Adam's hand-authored tables — propose exact changes and confirm before editing (vault-change workflow); never discard his custom items.**

L1. ☑ **D&D rarity axis** (2026-06-18) — per-item tables already correct (Common/Uncommon/Rare/Very Rare); renamed whimsical "Legendary" → `Dungeon Loot - Minor Wondrous`; built true `Dungeon Loot - Legendary` (32 SRD) + `Dungeon Loot - Artifact` (Dragon Orb). Spec: `LOOT-REMAP.md`.
L2. ☑ **Entry reconcile** (2026-06-18) — Budget now drives how-many/what-rarity; `Composition` rewritten as a rarity-agnostic presentation wrapper (wires in the orphaned Uncommon/Very Rare); standalone `Tier` retired to a stub; `Treasure Generator V1.0` → v1.1 flow (Budget → Composition → rarity table). Originals archived. *Provisional — playtest it.*
L3. ☑ **Integrate the 258 SRD items by rarity** (2026-06-18) — merged SRD items into all rarity tables, preserving Adam's curated rows verbatim and appending de-duped additions in pointer format: Common 30→31, Uncommon 50→87, Rare 40→101, Very Rare 20→64 (+ Legendary 32, Artifact 1). **247/258 reachable.** The 10 unreached are intentional: 5 generic `+1/+2/+3` entries (Adam covers +X gear) + 5 rarity-spanning variants (Belt of Giant Strength, Figurine of Wondrous Power, Feather Token, Potion of Giant Strength, Potions of Healing). *(Also fixed a magic-items.json attunement-wrap bug — +40 items now correctly flagged.)*
L3b. ☐ **Optional:** give the 5 rarity-spanning variants a home (small "Variant / Tiered Items" sub-table, or place each in its lowest rarity).
L4. ☐ **Band the Outlandish d300 by power + gate by party level** — tag each otherworldly item (utility / combat / high-power / reality-breaking); gate which bands surface by character level so DeLorean / Mini-Nuke class appear only high. Tagging, not rewriting — all items preserved.
L5. ☑ **Budgets T3/T4** (2026-06-18) — added `Dungeon Loot Budget T3` (Lv 11–16) + `T4` (Lv 17–20) per DMG 2024 tier targets; loot scales to L20.
L6. ☑ **Answered (2026-06-18):** loot is **dungeon-only** — no urban/wilderness loot tables exist (they have encounter/dressing tables, no loot suite). Decide later whether urban/wilderness get their own loot or share the dungeon suite.
L7. ☐ **Regenerate `table-registry.json/.md`** — stale after the rename/new tables (still lists old whimsical "Dungeon Loot - Legendary"; missing Minor Wondrous / Artifact / Budget T3–T4). No live consumer yet; regenerate before the compile pipeline reads it.

## Later — depth & independents
14. ☑ **PC entry — DONE 2026-06-18.** Two-layer **Character Genesis** ritual built into `genesis.html`: **The Sheet** (guided SRD L1 — species/class/background choice, 4d6-drop-lowest open roll, derived numbers, origin feat; heavy text by `SRD-Data` pointer) + **The Life** (Xanathar's "This Is Your Life" roll-chain, keyed to class/background). Backstory people/threads **auto-seed the Ledger as canon**; same ritual generates the successor. Retired the flat `SPARK`. Spec `CHAR-CREATION.md`; source tables `Engine/03._Tables/04. Character Genesis/This Is Your Life.md` + `Engine/02._Procedures/Character Genesis Procedure v1.0.md`. Verified 25/25 in a headless harness. **Follow-ups:** 14a ☑ **genericize the biography suite — DONE 2026-06-19** (rewrote XGE → original IP-clean spice-graded prose as `Life & Origins.md` + inline `CG`/`CG_CLASS`; XGE archived heritage-only; headless IP-scrub guard); 14b ◐ score methods — drag/tap-to-reassign **done 2026-06-19** (best-by-class default), Standard-Array + Point-Buy alternates still ☐; 14c ☐ in-app caster/gear pickers (v1 leaves these to the DM-guided step); 14d ☐ wire the tables into the Track B `tables.json` compile (still inline today); 14e ☑ **backgrounds → 19 (2026-06-19)** — 4 SRD + 6 Genesis-native + 9 standard archetypes rebuilt IP-clean (`Genesis Backgrounds.md`), more addable via the same pattern.
15. ☐ **Tarot wiring** — `genesis.html` has no tarot yet; wire the meta-story pulls in.
16. ☐ **P2 depth** — downtime, durable consequences, death-legacy, economy, non-Anglo name cultures.
17. ☐ **Combat** — parked for Fable.
18. ☐ **Own skill** — split Genesis off the `arcana-playtest` skill once the shape settles.
19. ☐ **Hex spatial substrate** (design captured 2026-06-19 → `SPATIAL-MODEL.md`) — a **lazy deterministic hex terrain** (`hash(seed,coords)`, never stored / never in AI context) under the existing node-graph; unbounded **fraying-edge** plane (coherence decays with distance = spice spatialized); node↔hex pinning + route-fitted geographic layout; and the **travel = wilderness-encounter series** wiring (route → terrain/biomes crossed → feeds the Wilderness Encounter Generator → distance scales the count → AI narrates). Node-graph stays the cognition layer; **not a hex-crawl.** Serves the anti-drift thesis (script owns geography; AI never holds the grid). **CORE WIRED 2026-06-19 (verified 21/21):** deterministic `hashCoord`/`terrainAt` + biomes, node↔hex pinning (origin 0,0; travel pins by bearing×leagues), a hex-terrain `renderHexMap` (biomes + fraying edge + strange-tile outlines) replacing the circular render, and travel now logs the journey as a terrain-typed **encounter count** (the Wilderness Encounter Generator hook). **Still deferred:** porting the actual Wilderness Encounter Generator tables inline so the encounters have content; world-coordinate-stable pan/zoom; the fraying rim feeding Strange/Mythic pressure generation.

## Parallel ops (non-blocking)
- ☑ **Engine duplication resolved (2026-06-18)** — Genesis now owns a clean engine at `Obsidian Files/Genesis/Engine/` (full self-contained home: app + docs + Engine). Dead files archived, stubs shelved, registry regenerated. The `Shifting Vale` / `Playtest Sandbox` engine copies are the human-DM system — out of scope for Genesis.
- ☐ Sanitize campaign-specific references only as tables get ported.
- Notion AI OS mirroring: **skipped for now** (Adam's call 2026-06-18).

---

## Starting Scenario / The Opening — the front door (diagnostic 2026-06-19)
**The thing the game reaches for *first*.** The live opening sequence is **World Genesis** (9 skeleton tables) → **Character Genesis** (the PC ritual) → **Starting State / Entry** (factions + pressures + arrival) → play. The wilderness generator is *not* the front door — it only fires on the player-initiated **Travel** verb, mid-session. So the opening scenario is the unconditional, every-session surface and the highest-leverage place to be good. (Heritage: the old `_START_New World Procedure` is the world-skeleton roller — a faithful ancestor of today's world-genesis — and its **sensory-first ordering** (smells/sounds/architecture before pressure + politics) is a principle worth preserving in the opening: ground the player in the *place* before the *powers*.)

**Census finding (read the wiring, not the docs):**
- **World-side = strong + wired.** `rollStartingState` (faction web w/ agendas+clocks, one Internal + one External pressure, Strange+ concretized behind the screen, all → Ledger fronts), `ssFactionTurn` drift tick, `renderPowers` panel, `handToDM` carries DM-only doom. Best-realized system in Genesis — **do not redesign.**
- **PC↔world bridge = the stub.** Shipped `rollEntry` rolls only Why-Here / Foot-in-Door / Standing + a *random* pressure as Opening Tension. It does **not** assemble the designed 5-slot **Enemies/Friends/Complications/Things/Places** bundle, does **not** pull the PC's backstory seeds (enemy made, lost lover, life-debt companion) into the opening, does **not** anchor promoted backstory NPCs to "here," ties Standing to a generic "local power" instead of the rolled dominant faction, and picks a random (not nearest-to-firing) pressure. **This is the gap** — the world is born rich and in-motion, then the character arrives into three adjectives.
- **Presentation also stubbed.** Player sees raw row text at founding, not the 6–10 word **Fragments** the whole opening is designed around (step 6). Fragments matter for the opening, not just travel.

**The opening punch list (highest-leverage first):**
- O1. ☑ **Entry bridge — DONE 2026-06-19 (Option C), verified 28/28 headless.** `rollEntry` rewritten as the full Step 3: harvests PC backstory seeds (`entrySeeds`), assembles the 5-slot **Enemies/Friends/Complications/Things/Places** bundle by preference order (PC seeds → factions → pressures → fresh), binds Standing to the dominant faction + routes it to Enemies/Friends by adversarial-standing, derives Why-Here from a search-thread, selects Opening Tension via `pickTension` (connects-to-PC → higher-spice → internal), anchors promoted NPCs to "here." **Option C:** empty slots filled by the script from new fresh `EB` tables (`Starting State - Opening Bundle.md` — five **d100, spice-graded** per `SPICE-CURVE` as Commitment-class tables: `1–66 Grounded · 67–86 Textured · 87–95 Strange · 96–99 Volatile · 100 Mythic`, with honest-rare curveballs — a bound fiend, a revenant, a rift, a sky-shard, a small local god; 1..100 coverage verified) — never punted to the DM. New `renderOpening` player panel (with band "juice" chips for Strange+) + `handToDM` bundle/DM-only tension. Also fixed the `cgHandleSec` `enemy`-tag gap. Tiebreak refinement still open: at founding all clocks are 0/6, so `pickTension`'s "connects-to-PC" leg only fires on adversarial faction-standing — could be smartened later to match backstory tags.
- O2. ☑ **Fragments for the opening surface — DONE 2026-06-19.** Authored 6–10 word sensory fragments for all 9 world-genesis tables (218 rows) + both pressure tables, held in a parallel `FRAG` map in `genesis.html` (no row-array surgery). Threaded through `lookup`/`rollTbl`/`rollPressure` (each now returns the row `idx` + fragment). **The player sees the fragment at the roll** (genesis cards + the triad nearby), and pressures stay veiled (player sees the fragment, DM holds danger+doom); the world view *after founding* shows real names (the reveal arc), and `handToDM` carries the truth. Bundle/entry rolls already read as fragments, so weren't duplicated. Verified: FRAG arrays align to row counts, runtime threading 0 misses in 9000 rolls, script parses clean.
- O3. ☐ **Carry the sensory-first ordering** from `_START_New World` into how the opening is *presented* (place before powers).
- Then mid-session verbs: ~~Wilderness Encounter port~~ **STALE — the generator IS ported** (`src/engine/wild-walk.js`, all 24 `wilderness-*` tables compiled; prep walks consume it). The real gap was the Travel verb ignoring it → **☑ SPECCED as `docs/TRAVEL-WALKS.md`** (2026-07-01 night: travel becomes the walk). Urban/Dungeon remain callable via prep walks.


## Do next (2026-07-10, SPRITE-GEN-V2 — the V3 wave; laws in docs/SPRITE-GEN-V2.md, tags in docs/SPRITE-TAGS.md)

1. ☑ **Cleanup + survey + laws + V3 generation + gate — DONE 2026-07-10** (worktrees 21→1; 2,431
   sprites surveyed; 143/161 V3 sheets generated by Adam's codex, 142/143 style-pass; 650 sliced
   to `dev/sprite-sheets/incoming/v3/` with sizing + casting tags; off-angle pack shipped CC0).
2. ◐ **Round 2 PARTIAL (2026-07-10 PM: 5 arrived, 4 folded, cosmic-large-09 rejected)** — the
   remainder + round-3 run at the ~5PM window per `regen-v3/round3/RUN-NOTES.md` (recovery
   step 0 first; packets hardened: expression/bug-angle/3-attempt/never-discard).
3. ☐ **Registry fold-in** — v3-sizing.json + v3-tags.json → `data/sprite-registry.js` (regenerate;
   heads-line-up calibration vs the 32 protected rulings).
4. ☑ **Retro-tag the committed corpus — DONE 2026-07-10 PM** (896 tags + true-scale sizing at
   dev/model-qa/; ash drift CONFIRMED in the 9 npc/kids/animal sheets → quarantined + round-3
   re-queue; 13 relabel-to-art, fantasy-npcs-2 systemic).
5. ☐ **NPC expression pass** (expression-variant law) after Adam settles sprite assignments.
6. ☐ **Land the sprite lane last** (claude/sprite-gen-refactor-magenta: 23 commits + 59 parked
   sheets) at the gen-wave sweep, per standing plan.
7. ☐ *(carried from the 2026-07-09 sprite-transition block at its archive roll)* **XL/titan regen
   round** — the 64 sheets in `dev/sprite-manifests/XL-REGEN-PROMPTS.md`; WIP banked on
   `claude/fantasy-sprite-slicing-fc3187`. **Fantasy review pass** — 486 unreviewed in
   `dev/sprite-review.py` (:5179), `flagged ⚠` filter first. **Item kind rider** — add `item`
   to the v2 parser/registry (571 item cells skipped).

## Do next (2026-07-11, BW4 MOTION & FEEL LANDED — the wave opened two Adam-gated items)

BW4's 4 buildable units are on master + pushed (camera tweens, spawn grace, hit-stop mechanism,
turn rhythm — details in CHANGELOG 2026-07-11 BW4, HANDOFF top). Two open, both need Adam:

1. ☐ **MF-3b — hit-stop production wiring (Adam's event-shape call).** Hit-stop/recoil/crit are
   built+tested but DORMANT: production plays `hit-damage` (base shake+flash) but never passes
   `opts.attackerId` (gates the freeze+recoil) nor emits `hit-crit` (gates crit-response). FIX =
   thread `attackerId` + a crit flag onto the hp ledger event (EVENT-CONTRACT addition at the
   `DM_EVENT_FIELDS` boundary). Smaller than a strike/hurt remap, no double-fire risk. fall-death
   hold is already live.
2. ☐ **MF-5 — the feel gate.** Play 3 combat rounds ("does it feel like moving miniatures?") +
   the instrumented 10s turn-burst. Best AFTER MF-3b (so the burst shows hit-stop) and mind the
   documented capture-vs-tween screenshot limit. Interim evidence committed: the loop-gate
   contact sheet + `loop-01-camera-mid-tween.png` + the fake-clock tween-curve harnesses.
3. ☐ Then the BW2/BW3 carry-over below (PACKET-01 mocks, beauty-shot eyeball, GIT-LFS, UW1-4).
