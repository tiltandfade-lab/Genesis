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
- Then mid-session verbs: **Wilderness Encounter port** (the Travel caller currently returns an encounter *count* with no content — generator is mature, just unported; tables misfiled under `Dungeons/`), then Urban/Dungeon (no live caller yet — dark, not blind).

## Do next

**⭐ IMMEDIATE — SOCIAL is COMPLETE (all 4 phases built + verified 2026-06-28).** The anti-drift push
(`feat/antidrift-content-gifts-tools`, Phases 1–2) merged to master; Phases **3 (events) + 4 (surfacing)**
landed in the follow-up `/code-review` + fix session (`verify-social` **97/97**, `verify-dm-events` 29/29,
`check-manifest` green). The social analog of combat now runs end-to-end: declared roll → priced DC →
committed shift → DM-digest stance + the gated player-facing disposition tell. In rough order, next:
1. **The table re-authoring afternoon** — Adam's stated next focus; the plan is ready in
   **`docs/TABLE-REAUTHORING-PREP.md`** (rubber-stamp the 6 resolve-first decisions, then work the
   prioritized worklist top-down). This IS the "table quality pass" below, now scoped + prepped.
2. **IP scrub** surfaced by the prep: `Art Depiction` rows ~46–96 (Forgotten-Realms lore-dump) + the
   ~15-file WotC creature/race/plane spread (`GENERICIZATION-SCAN.md`). Best folded into the re-authoring.
3. **Outlandish diegetic reskin + anachronism-intrusion hooks** (decided 2026-06-28, not built).
Also still open from the social spec: building the **gift `codex.gifts[]`** flag + granting hooks, and
wiring the tool/DC/charm references into the DM digest. SOCIAL follow-ups (non-blocking): drift-to-baseline
(§1.4, ships off), the detected faction-member group cascade (waits on the faction hook), and a live-play
visual check of the disposition tell over the DM bridge.

---

**⭐ CONTENT QUALITY TRACK (Adam's call 2026-06-27 — do in order).** With the leveling spine + level-up
picker complete, the next focus is content depth/quality, in two ordered passes:
1. **Table quality + row-quantity refinement pass (FIRST).** Sweep the generator/oracle tables for quality
   (voice, distinctness, causal coupling on the 5-band spice ladder) and quantity (promote thin tables to
   full row counts). Prerequisite to #2 — the re-authored content leans on these tables. Use the
   sample-review protocol (5-band samples → Adam's voice review → full authoring); see
   `docs/TABLE-USAGE-AUDIT.md` + the prior table-improvement passes for method.
2. **Subclass + feat + background re-authoring pass (AFTER #1).** Re-author for depth + balance:
   **subclasses** (`data/subclass-progression.js` — today the lone SRD subclass/class, verbatim; give real
   options + IP-clean depth), **feats** (`data/feats.js` — today a 12-feat DRAFT; balance-tune + expand;
   decide Magic-Initiate-style feats, which need a nested spell picker, deferred today), and **backgrounds**
   (`data/species-backgrounds.js` / `Genesis Backgrounds.md`). Folds in the earlier "balance-tune draft
   general feats" item. The level-up picker + creator already consume these data files, so re-authoring is
   data-only (regenerate generated files; never hand-edit them).

Then the remaining T1/T2 polish (none blocking): `wilderness-threat-identity-t1/-t2` tables; CR 9–10
capstone density (~14 stat blocks); a live Bridge playtest of leveling + the picker + crit/codex.

---

**⭐ ECONOMY / MONEY — the priority currency — ☐ DECIDED (in discussion) 2026-06-27, not yet built →
decision rows in `DESIGN.md` (2026-06-27).** Framed Genesis's loops + the currencies that close them; **money
is the priority currency** (the hub that buys *partial* access to the others). The other currencies (Knowledge,
Standing, Heat, Holdings) stay **sketches**. **v1 = the buy + sell spine** (selected scope): wallet + buy/sell
EVENT-CONTRACT events · prices **derived from the existing loot rarity axis** (+ SRD base prices) · a shop =
merchant **codex NPC** + shop location + inventory + buy/sell **UI** (interface menus are in-scope — the §3
no-menu rule is narrative-only) · **consumables/potions = the keystone sink** (the cure for gold-death) · a
**sell button** (merchants pay below value + limited coin = saturation guard) so urban/wilderness treasure
matters · a light **place-tier** field on stock (escalation by place/access, *not* PC level). **The one loop v1
must nail + balance:** loot → buy gear+pots → consumables drain → need gold. **Fast-follow:** valuable-loot
*content* (urban/wilderness gem/pelt/rare-herb/art tables → the sell system). **Deferred expansions:**
Holdings/base economy (the high-tier sink) · services (hirelings/training/transport/forgery) · crafting &
downtime · faction-gated black markets / standing-priced stock · dynamic supply-demand & haggling · regional
prices. **Discipline:** one complete loop tuned before widening — not 15 economies at once. **SRD baseline (a floor to
build ON, not finish on; verified in `Reference/SRD-Data/`):** the mundane economy is mostly **drop-in** — coinage,
the half-cost sell rule, priced gear/consumables (Potion of Healing 50 GP, scrolls 30/50…), food/drink/lodging,
**Lifestyle Expenses** (ready-made recurring upkeep sink), Hirelings, **Spellcasting services availability-gated by
settlement size** (in-rules precedent for place-tier), mounts/vehicles. **We author only:** magic-item **prices**
(items have rarity but *no* cost field → rarity→gold bands) + **treasure content** (no gem/art/trade-goods tables =
the valuable-loot fast-follow). So v1 is largely "wire up what exists," then build richer codex-grounded commerce on
top. **DMG source map (2024 DMG fills every SRD gap — vision-read 2026-06-27; copyrighted + git-ignored → MINE +
GENERICIZE, never paste tables in):** magic-item **rarity→value** (Common 100·Uncommon 400·Rare 4,000·Very Rare
40,000·Legendary 200,000·Artifact priceless; consumables ½) = our **v1 magic pricing** (SRD has rarity but no cost);
**gemstones/art/trade-goods** (gems 10–5,000 GP, art 25–7,500 GP value bands) = the **valuable-loot fast-follow**
content; **Adventure Rewards** (Individual Treasure + ~1 hoard/session by CR; T1/T2 ≈ 500→4,400 GP/hoard) = the
**faucet** half of the balance problem (now both sides known); **Treasure Themes** (monster loot preferences) = cheap
anti-drift flavor; **Bastions** (L5-gated character-owned location, 7-day turn cadence, gold+time facilities) = the
**blueprint for the deferred Holdings expansion** (the high-tier gold sink). **Lodging rule — "shelter has an owner" (DECIDED 2026-06-27):** a long rest is **never hard-gated**, but a bed has
an owner → three sources, each a different currency: **sleep rough** (free but exposed — encounter/exhaustion risk),
**a town bed** (SRD inn price 7 CP→4 GP/night), or **a host's favor** (spend standing — a codex flag "owes lodging",
finite). Lifestyle's teeth = a comfort/safety/social differential, not a gate. Lodging is the most frequent sink (keeps
gold wanted nightly without forcing it) + the **first place Standing appears** (as a codex favor flag, not a subsystem)
+ near-zero new machinery + the inn doubles as the social hub (doorway to the job board + rumors).
**Open within v1 (next design pass):** rarity→gold band numbers · the consumable-sink mechanic + drain rate
· the flat sell ratio · merchant/shop codex wiring + the buy/sell UI shape · whether
urban+wilderness get coin/loot faucets now.

---

**⭐ DMG ANTI-DRIFT MECHANIC CANDIDATES — ☐ SKETCHES (not decisions) 2026-06-27.** Surfaced reading the 2024 DMG for
"what could the script OWN instead of the DM inventing?" **Priority lens (Adam's call 2026-06-27): anything that
prevents drift + invention where it doesn't need to be is a HIGH-PRIORITY system** — the script holds truth, the AI
interprets (the north star). All of these are currently 100% DM-invented, all lean on systems we already have (codex,
digest, MM), all are dice/script-over-fiat. In rough priority:
1. **⭐ NPC Attitude + social-check resolution** (DMG Ch.2) — the biggest currently-invented surface. NPCs get a
   **starting attitude (Friendly / Indifferent / Hostile)**; a **Charisma check shifts it one step** (attitude
   modifies the DC). Mechanizes *how an NPC feels about you* + *whether persuasion/bribe/intimidation works* — both
   pure DM fiat today. Tiny build: add `attitude` to the codex NPC + a social resolver + "success shifts one step."
   The **social analog of combat** (combat parked for Fable; social mechanizable NOW). **Attitude IS per-NPC
   Standing** — concretizes the Standing currency sketch + gives the draft `NPC Honesty`/`NPC Trust Lever` tables a
   live state; the "owes you a bed" lodging favor is an attitude artifact.
2. **Morale / Fight-or-Flight / Parley** (DMG Ch.2) — a creature checks morale (Wis save) when **Bloodied** or an
   ally drops → may **flee / surrender / parley** (resume combat where it left off if talks fail). Removes DM whim
   over life-or-death outcomes; serves the Charter's *honor-the-cool* + *telegraph-danger*. **Not blocked by combat
   deferral** — it's the *narrative* decision of whether a fight continues/defuses, shippable before the engine.
3. **Consistency scaffolds (keep-the-DM-on-track, near-free, serve via the digest):** the **DC ladder** (Very Easy 5
   → Nearly Impossible 30) so the same task gets the same DC across a long binge; **damage/hazard by severity** so
   improvised environmental danger (fall/fire/collapse) is consistent, not re-invented each time.
4. **Creature creation by reskin/CR-benchmark** (DMG Ch.3) — reskin a stat block / hit a CR target to generate stats
   for a *generic statless* walk-on (a guard, a merchant who turns hostile) on the fly, so the DM never invents
   numbers mid-scene. (Genesis has the MM for named monsters; this fills the generic-NPC gap.)
*(DMG is copyrighted + git-ignored → mine/genericize structure, author IP-clean; never paste tables in.)*

---

**⭐ XGtE + TASHA'S ANTI-DRIFT MECHANIC CANDIDATES — ☐ SKETCHES (not decisions) 2026-06-28.** Adam added
*Xanathar's Guide to Everything* + *Tasha's Cauldron of Everything* to `Reference/` (both copyrighted, git-ignored
like the DMG/MM/PHB — **mine structure, author IP-clean, never paste their tables in**). Read for the same question as
the DMG: *what is the DM inventing that the script could OWN?* Cross-checked against the actual tables (so these are
real gaps, not theory). These **extend** the DMG block above — same priority lens (anything that removes invention is
high-priority); the top two **merge into the DMG social/morale candidates** rather than competing with them. In rough
priority:

1. **⭐ Parleying with creatures** (Tasha's, *DM's Tools*) — the **non-NPC analog** of the DMG NPC-Attitude candidate
   (#1 above) and the resolution layer the DMG morale/parley candidate (#2) is missing. A creature has a **reaction**
   and a **thing it wants** (leverage), so "can I talk my way past the beast / buy off the bandits / make the monster
   leave?" stops being pure DM whim. **The hook already exists in our own tables:** `Wilderness Encounter Type` row 5
   literally says *"Resolve via Social Interaction rules (Attitude shifts, Persuasion/Deception)"* — a system we don't
   have yet — and we already roll `Monster Motivation` / `Monster Behavior if Hunted`, which **feed** this directly.
   **Build:** fold into the NPC-Attitude resolver as the creature path (attitude + a rolled `wants` lever). The single
   biggest synergy across both books → do it **with** DMG #1/#2 as one social/parley subsystem.
2. **⭐ Tool-proficiency uses** (XGtE, *Tools*) — each tool kit defines **what it actually lets you DO** + the check it
   keys (herbalism kit → identify/brew; thieves' tools → set/disarm; forgery/disguise kits; etc.). Today whether a
   tool proficiency applies *and at what DC* is 100% DM fiat. Confirmed gap: `tool prof` appears only in
   `class-progression.js` as the *proficiency list* — nothing says what a tool does. **Pairs with the DMG DC-ladder
   consistency scaffold** (#3 above): a small `tool → {tasks, DC, ability}` lookup the digest serves so the DM
   adjudicates the same tool the same way across a long binge. Low build, high consistency payoff.
3. **⭐ Supernatural gifts — Charms & Blessings** (Tasha's) — a **reward currency we don't have**: minor one-shot
   *charms* (granted by a shrine / discovery / event) and lasting *blessings* (from a deity or power), distinct from
   gold and from magic items. Currently the DM invents these wholesale. Concrete d-tables; slots cleanly next to the
   existing reward surfaces (`Urban Boon` is *luck*, this is *persistent favor*), feeds the economy's "rewards beyond
   coin+item," and pairs naturally with the bardo visions + Mythic spice. **Epic Boons** are T4 → deferred (the
   `LEVEL_CEILING` rule). Build = two spice-graded tables + a codex `gifts[]` flag on the PC.
4. **Puzzle toolkit** (Tasha's) — a puzzle **generator** (type + mechanism + a *fair* solution + a failsafe so a stuck
   solo player is never wall-blocked). Mechanizes "DM invents a puzzle." We have `Dungeon Interactable Object` /
   `Dungeon Secret*` but no puzzle structure. Good dungeon anti-drift; medium build.
5. **Group/individual Patron** (Tasha's) — a **patron archetype** set (academy / syndicate / order / military / crown /
   …) each with the *kind* of work it assigns + benefits + strings. Formalizes "who employs the PC," which the DM
   invents per quest. Overlaps **factions + the job board + codex** — likely a *patron* field on a faction/NPC record
   rather than a new system; revisit when the codex social layer (#1) lands.
6. **Lower / mostly-covered (enrichment, not new systems):** **environment × party-tier encounter density** (XGtE) —
   our encounter tables roll *type* and our threat-identity tables are T1/T2-split, so the spice+threat system already
   covers most of this; XGtE adds content depth, not a missing mechanic. **Ambient magical phenomena** (Tasha's) —
   already served by `Urban/Wilderness Magic Effect` + the Strange/Volatile/Mythic bands; content enrichment only.
   XGtE's **optional rules** (falling cap, suffocation, going-without-rest/exhaustion timing) **fold into the DMG
   "damage/hazard by severity" consistency scaffold** (#3 above), not separate items.
7. **Deferred (named so they don't sprawl):** **Sidekicks** (Tasha's companion stat-progression) — relevant to the
   companion-autonomy question but entangled with the parked combat engine; **encounter-building XP math** (both
   books) — combat-parked, revisit with the Fable combat engine.

*(Both PDFs are copyrighted + git-ignored → mine/genericize structure, author IP-clean; never paste tables in. The
standout first build across all three books is still the **NPC-Attitude / parley social subsystem** — DMG #1/#2 +
Tasha's #1 are one system.)*

**☑ CONTENT PASS — items 2 + 3 promoted to BUILT (2026-06-28, branch `feat/antidrift-content-gifts-tools`).** Adam's
"content wins first" call. Authored as IP-clean Genesis-native Engine tables, compiled clean (0 coverage bugs),
emitted to `tables.js` → **immediately rollable via the Oracle** (the DM rolls instead of inventing):
- **Charms & Blessings** (item 3) — `Supernatural Charms.md` (d20 **Fork**, 12 Grounded/5 Textured/3 Strange — minor
  finite-use perks) + `Supernatural Blessings.md` (d20 **Commitment**, reaches Volatile+Mythic — lasting favors,
  written to the Ledger as canon about the soul). A new reward currency distinct from coin + loot. *Still deferred
  (the system layer): a codex `gifts[]` PC flag, automatic granting hooks, and a player-facing "your gifts" surface.*
- **Tool-proficiency uses** (item 2) — `Tool Proficiency Uses.md` (Scene & Situation) — a `tool · ability · task · DC`
  **lookup reference** (not a roll table; the compiler skips it) anchored to the standard DC ladder, so tool rulings
  stay consistent. *Still deferred: serve it through the DM digest, and pair it with the DMG DC-ladder scaffold.*

**⭐ BACKLOG PUSH — workflow fan-out (2026-06-28, same branch).** A multi-agent workflow (author → adversarial review
per item) cleared most of the remaining anti-drift backlog in one pass. Compiled clean (0 coverage bugs),
`check-manifest` OK. Status:
- **SOCIAL subsystem (candidate #1) → ☑ SPECCED `docs/SOCIAL.md` (draft, spec-only).** Attitude ladder + social-check
  resolver + morale/fight-or-flight + creature parley, collapsing DMG #1/#2 + Tasha's parley into one resolver;
  detected>declared events; 4-phase Tier-2 build plan. §9 open questions resolved with Adam 2026-06-28. **☑ Phase 1
  (data model) BUILT 2026-06-28** — `status.attitude` on the codex record + attitude writers/reader
  (`codexGetAttitude`/`codexAttitudeOpen`/`codexSetAttitude`/`codexSetTerrified`/`attitudeLabel`), clamps + lazy
  default + terrified override, hidden from player view; `dev/verify-social.mjs` 30/30, `check-manifest` green.
  **Next: Phase 2 = the `src/engine/social.js` resolver** (socialDC/applyLeverage/resolveSocialCheck/moraleDC), then
  Phase 3 events, Phase 4 digest+UI. Built alongside Phase 1: `NPC Opening Attitude`, `Creature Parley — What It
  Wants`,
  `Morale Outcome` tables (rollable).
- **Puzzle toolkit ☑ BUILT** — `Puzzle Type/Mechanism/Solution Path/Failsafe` (the Failsafe = the solo no-wall-block).
- **Patron archetypes ☑ BUILT** — `Patron Archetype` + design note (patron = a role on an existing codex record).
- **DC ladder + Hazard severity ☑ BUILT** — the DMG consistency scaffolds, as lookup references.
- **Generic creature reskin ☑ BUILT** — `Walk-On Quick Stats` (reskin method + low-CR quick numbers; reference).
- **Still deferred (the SYSTEM layer, not content):** building SOCIAL (pending sign-off); wiring the gift/tool/DC
  references into the DM digest; the codex `gifts[]` flag + granting hooks; a puzzle/patron *generator* call-site in
  prep. *(IP follow-up surfaced: a pre-existing Adam table, `Art Depiction.md` row 93, names WotC deity "Lurue" —
  flag for the genericization scrub, not touched.)*

**⭐ NEXT TABLE RE-AUTHORING PASS — PLANNED 2026-06-28 → `docs/TABLE-REAUTHORING-PREP.md`** (workflow-synthesized
prep for an afternoon of adding flavor / revising bland rolls). Ready-for-session: ~26 weak tables prioritized (9
high/11 med/6 low), **6 RESOLVE-FIRST decisions** (each with a recommendation), the authoring checklist + voice ruler,
an IP-scrub list, and THE BAR exemplars. **Key reversal:** the old "Place Gen / Myth thin" finding is stale — those
are done and are now the bar; weakness migrated to the **Atmospheric & Sensory + Architectural** `voice_critical`
Fragment feeders (still thin d20s on the dead "Less-Grounded" vocab), the small NPC atoms, and the Quest tables.
**Pre-work ☑ DONE 2026-06-28:** the 28-table stale-band-vocab sweep (`Less-Grounded`→`Textured`) + the Urban
Encounter Type row-20 markdown fix (recompiled, 0 bugs). **`Dungeon Loot - Outlandish` — DECIDED:** keep the content,
**reskin the cross-IP entries diegetically** (describe the thing as a fantasy world would perceive it — a DeLorean as
a "horseless gull-winged silver chariot"; the player who thinks gets the joke, and it neutralizes the trademark-name
IP risk). **New backlog item:** author **anachronism-intrusion hooks** (e.g. "a vessel from elsewhere crashed into
the world") so this loot tier has narrative grounding — to explore. The Outlandish Origin-column reskin is now a
re-authoring target in the prep doc.

**☑ RESTRUCTURED 2026-06-28 → `docs/REAUTHORING-SWEEP-PLAN.md`** (5-angle recontextualization scan).
The flat 38-item worklist is now an **executable two-lane plan**: recontext + consolidation roughly
**halves** the hand-authoring before any prose. **Lane A (autonomous-safe, overnight):** 3 recontext
engine primitives (lens-operator / compose / merge-helper) + 4 SRD-mined lenses (Condition / Hazard-Effect
/ Trait→Behavior / Magic-Item) + 3 new content tables + the **bestiary substrate** (index/compile/selector).
**Lane B (propose-and-wait, Adam approves each):** the consolidation (merge/retire/relabel ~11 items), the
**creature IP scrub** (a scripted token-swap that doubles as the creature-reskin mechanism — lifts the
~15-file creature cluster out of flavor work), the irreducible hand-authoring residue (#2 Art Depiction the
long pole), the Outlandish reskin, and the **monster-into-game wiring** (the bestiary is 100% unwired today;
creature = a dead name-string). Per-monster flavor + quest-hook tables join the sweep (additive +
archive-first on Adam's ~40 custom d10s). Decision-pending: agent-draft-then-review vs. self-author per
voice-bearing table.

---

**⭐ CODEX — relational entity layer — ☑ SPECCED (draft) 2026-06-24 → `docs/CODEX.md`.** The Saltrest
playtest exposed the core gap: the DM **invented the whole cast** (Quill, Sabarra, Coll & Mire, the
Cinderyard, Tinker's Stair, the key) because — confirmed by reading the code — **Session-Prep rolls the
stage, not the players**, and there is **no entity store** (NPCs = ledger prose + flat gazetteer rows).
The fix: NPCs / Locations / Items / Factions become **relational records in `w.codex`** (`id`, `rolled`
verbatim, AI-interpreted `fields`, typed `links[]` wikilinks, `status{known,soft,at,condition}`) — the
Obsidian model. **Division of labor (the lesson): the engine rolls the atoms (`rollNPC`/`rollPlace` chain
the already-compiled tables — 37 NPC tables exist, 0 wired); the AI only assigns meaning + wires links.**
Written via new EVENT-CONTRACT types (`codex_add`/`codex_link`/`codex_update`/`codex_reveal`). **Prep gains
a casting pass** (each frontier rolls soft location + 1–2 NPCs + item → records; synthesis *connects*, not
invents). **Session frame:** explicit **Start Session** button (world-select) → prep casts the codex →
loading cinematic → chat once the cast is hard data; **End Session** recycles soft prep. **Gaps to author**
(playtest-confirmed): a **building/interior generator** (only thin `In-Building Complications` today) and a
**plot-item/key/relic table** (`quest-macguffin` is a category, not "a small old key"). **Phasing:** (1)
codex data model + `codex_*` events + gazetteer/faction migration + digest slice → (2) `rollNPC`/`rollPlace`
→ (3) prep casting → (4) Start/End session flow → (5) the two missing table-sets → (6) Codex UI panel.
Each phase: `check-manifest` + `dev/verify-codex.mjs` + branch-per-phase `--no-ff`. Decision rows in
`DESIGN.md` (2026-06-24). **Status: ☑ Phase 1 BUILT 2026-06-24** (`src/world/codex.js` = the store +
two-tier lifecycle + recontextualization + sanitized player projection + `codex_*` events + gazetteer/
faction migration + digest slice; `dev/verify-codex.mjs` 39/39). **☑ Phase 2 BUILT 2026-06-24**
(`src/engine/codex-roll.js` = `rollNPC()`/`rollPlace()` — the engine mints the atoms by chaining the
already-compiled NPC/place tables via `rollTable` into a `codexAdd`-ready payload: `rolled` (raw dice
verbatim) + a player-safe `fields` glance-read + DM-only `dm` levers; rollers don't write the world, prep/
the DM emit `codex_add` events. Race→species name mapper + place name/desc split. `dev/verify-codex-roll.mjs`
27/27). **☑ Phase 3 BUILT 2026-06-24** — `assemblePrepBundle` gains `pbundleCast` (each frontier rolls a
soft location + 1–2 NPCs, one biased to the hook's questgiver, into the bundle); `startPrep` mints them
into `w.codex` as `provenance:"prep", soft:true`, binds the location to the frontier node + places the
NPCs there; `lockOnContact` locks the location to canon on entry. The summary carries a compact cast for
Stage-1; the synthesis pass now *connects* a dice-dealt cast instead of inventing nouns. `verify-prep-bundle.mjs`
47 · `verify-prep.mjs` 34. **☑ Phase 4 BUILT 2026-06-24** — `startSession(id)`/`endSession()`
(`src/world/play.js`): Start enters the world → `beginSession` (casts the codex) → `wakeIntoWorld`
cinematic → DM opens the scene once the cast is hard data (idempotent on a live session); End clears
`sessionLive`, writes a closing beat, recycles unvisited soft prep, returns to the shelf. UI: a ▶ Start
session button on every world card + a session-aware Start/End control in-world + a "session live" badge.
`verify-session.mjs` 16/16 (browser render sandbox-blocked here — eyeball at playtest). **☑ Phase 5 BUILT
2026-06-24** — the two missing table-sets, as three net-new **d300 Commitment** tables (198/60/27/12/3,
authored via parallel agents, compiled → 337 tables, 0 real bugs): **`building-interior`** (connected spaces
+ feature + who/what's inside — the "gran's house" fix), **`plot-item`** (specific objects + why + what it
opens — replaces abstract `quest-macguffin`), **`plot-lock`** (the key/lock complement). Mythic rescaled to
cosmic. Wired `rollItem` (item-as-pointer + optional `lock`) + `rollBuildingInterior`; `verify-codex-roll.mjs`
38/38. **☑ Phase 6 BUILT + MERGED (2026-06-25)** — the Codex UI panel (`548b54b`), plus the
`codexProvenanceReport` ratio test (`a02840a`) + world-gen place grounding; the live re-playtest flipped
the mechanical baseline ~20% → 60–82%. **The Codex track is complete.** (`codexProvenanceReport` ran vs the
~20% Saltrest baseline; the anti-drift loop is validated end-to-end.) **☑ Code-review follow-ups CLOSED
(2026-06-26, `feat/codex-loose-ends`):** the **soft-pool eviction cap** is built — `codexEvictSoft` (default
`CODEX_SOFT_CAP=24`) ages out the oldest untouched soft records beyond the cap (keeping the freshest as the
§8b pool; hard/known/linked/bound are sacred), wired into `prepRecycleStale` so the pool — and the digest —
stays bounded independent of session count. **☑ Prep item-casting** also done — `pbundleCast` rolls the
macguffin via `rollItem`, `prepCastFrontier` places it at the frontier location. (Open consistency nit:
`rollVision` mutates despite the `roll*` prefix → rename `fireVision`, separate change.)
Also folds in the playtest's own DM-Charter locks (verbatim player dialogue, open handoffs/no menus, no
tactical coaching, no NPC-bleed) which are already merged.

**⭐ SESSION-PREP SYSTEM — ☑ SPECCED (draft) 2026-06-23 → `docs/SESSION-PREP.md`.** Adam's design call: the AI DM should **prep** like a human DM (maps/dungeons/NPCs/treasure/secrets + a throughline) *before* play, knowing the player may deviate entirely. **Core principle — "the story is in the dice":** over-roll the cheap segment generators, then the AI does a **full synthesis pass** (harvest the throughline *latent in the rolls*, prune, connect via the segment transitions, reskin to the world) — honor the rolls, invent only for fun/connection, DM final say. It **generalizes `DM-CHARTER` §8.4** (soft-until-contact) from once-at-founding to a recurring heartbeat, and is **the system that consumes the orphan tables** (`TABLE-USAGE-AUDIT.md`). Locked: emergence+synthesis (not spine-first); **reskin at prep**; **walk = sub-map** (segments=nodes, transitions=edges; reconcile into defined geography); **multi-environment** scope with quest hooks, spatially plausible from the frontier; deviation → lazy-gen + prep-debt + recycle; fires on **soul creation** (+ planned session button). **Build track:** (1+1b) ☑ **all three walk-rollers BUILT 2026-06-23** — `rollUrbanWalk` (`src/engine/walk.js`, ported from Obsidian `Urban Procedure v3.1` — 16 topologies, dedup+overflow, weighted encounters, scene frames), `rollDungeonWalk` (`dungeon-walk.js`, from `Dungeon Procedure v4.2` — 12 topologies, depth-budgeted loot, Myth-Seed-affinity boss/revelation), `rollWildernessWalk` (`wild-walk.js`, authored fresh — linear leg journey, biome-shift, arrival site). All return a walk data structure (segments=nodes, transitions/route=edges); dungeon/wild reuse walk.js generics. Foundational compiler change: `compile-tables.py` now emits `row[5]` structured cells (multi-column prep tables keep their columns); `rollTable().cells` added. Headless-verified (`dev/verify-walk.mjs`, 2667 assertions). Consumes the orphaned Urban Segment + dungeon/wilderness families. (2) ☑ **synthesis-pass contract BUILT 2026-06-23** → `docs/SYNTHESIS-CONTRACT.md`. Multi-environment, **staged** (Stage 1 harvest the throughline latent in the over-rolled pile → Stage 2 per-env **roll-keyed overlay** + briefing), output = overlay+briefing. Deterministic half built + verified (`prep-bundle.js` assembler fires the 3 walk rollers + binds a quest hook per env + extracts ledger context; `quest-hook.js` roller; `prepBundleSummary` for the cheap Stage-1 view; `dev/verify-prep-bundle.mjs`, 32 assertions). The two staged prompts live in `Engine/00. _System/AI Prompts/synthesis-{harvest,reskin}.md`. **Cardinal rule:** annotate the rolls (keyed by ref), never rewrite; pruning = role:skip, never delete. *The LLM synthesis itself runs over the DM Bridge at play time (qualitative — known tune item: is Stage-1 harvest good enough on summaries alone?).* (3+4+5) ☑ **prep state + binding + cadence BUILT 2026-06-23** → `src/world/prep.js`. `startPrep` binds each prepped environment to a **soft "rumored frontier"** map node (soft edge = the quest hook leading there); `applyPrep` enriches frontiers from the DM's synthesis overlays + writes soft new-canon; `lockOnContact` flips soft→hard on entry (Charter §8.4); recycle unvisited prior-session frontiers; prep-debt for unprepped directions. **Cadence:** `beginSession()` fires prep every session + `⎘ Prep handoff` button; EVENT-CONTRACT gains `prep_applied`/`prep_contact`; `renderHexMap` draws soft frontiers dashed/dim. Headless-verified (`dev/verify-prep.mjs`, 22 assertions; caught+fixed a slug-collision id bug). *Browser render unverified in this env (preview sandbox-blocked) — confirm at playtest.* **🎲 THE SYSTEM IS NOW PLAYTESTABLE END-TO-END OVER THE BRIDGE.** **Still unbuilt (refinement, not a blocker):** (6) fuller orchestrator (plausibility-from-frontier; NPC/Place depth rollers). **Improvement candidates:** the `quest-*` + NPC-hook tables (v1). Decision rows in `DESIGN.md` (2026-06-23).

**TABLE USAGE AUDIT — ☑ DONE 2026-06-23 → `docs/TABLE-USAGE-AUDIT.md`** (regen: `python3 build/gen-table-usage-audit.py`). Maps every compiled table → source file → trigger (procedure/chain/wired-code), surfacing **89 of 248 source files as Oracle-only** (no auto trigger): whole unwired systems — the **Urban Segment/Scene Frame** walk (~35 tables), the **NPC depth suite**, the **Place-Gen d100 pass**, the **Quest suite**, **Faction/Pressure/Grim-Portent** clocks. These are exactly the Session-Prep payload (above) — wiring prep is how they re-enter play.

**TABLE-IMPROVEMENT PASS — ☑ COMPLETE 2026-06-23.** All three tiers done: T1 Place Gen (☑ 2026-06-22, reviewed 06-23), T3 NPC atoms (☑ 2026-06-23), **T2 ☑ 2026-06-23** — `Myth Costs` (d12→d100) + `Myth Becomes Geography` (d10→d100) rebuilt to full Commitment ladders, and the new **`urban-pressure`** d100 oracle authored (fills the freed `urban-encounters` slot; citywide single-roll pressure for slow urban play). All three: 66/20/9/4/1 band split, samples reviewed by Adam first. Myth originals in `Mythic Events/zz_Archive/`. Recompiled — **332 tables, 0 real bugs.** The three new tables are **content only — deliberately NOT wired** (Adam: "find a way of connecting them, but don't wire the unwired tables yet"); rollable today via the Oracle tab.

**⭐ CRIT-MAGNITUDE SYSTEM — ☑ SPECCED + LENS ORACLE BUILT 2026-06-23 → `docs/CRIT-MAGNITUDE.md`.** Adam's full design call captured: nat 20 / nat 1 → a **second d20** (the magnitude die) scaling Standard → Amplified → Mythic (= Local → Regional → Planar/Cosmic). 20/20 = Mythic Success (permanent boon → canon, e.g. the Light-of-Lathander shrine); 1/1 = mirror Mythic Failure (humor by default, pitch-black + permanent at high stakes). **The "missing middle" is now built:** two d12 **lens** tables (`Mythic Success Lenses` / `Mythic Failure Lenses`, Session Mechanics / Consequences, compiled) — each row a *vector* (kind of permanent change), AI fills content, so it fires on *any* d20 action. **The magnitude die now also sets a count:** 20/11–14 = 1 lens · 15–19 = 2–3 · 20 = full cascade (canon); failure inverted (7–10 = 1 · 2–6 = 2–3 · 1 = cascade). Cascade rules: draw distinct lenses (count=kinds, intensity=degree, orthogonal), weave from one act, the *place* lens hands to the Myth suite. **☑ ENGINE WIRING BUILT 2026-06-26 (`feat/crit-magnitude`):** `src/engine/crit.js` — `rollCritMagnitude(natural,{magnitude})` (pure roller: `critBand` band→count for both ladders, `critDrawLenses` draws distinct lenses, row-1 place lens rolls `myth-seeds`), the `crit_outcome` event in `applyEvent` (Mythic→Ledger canon, amplified→outcome), and the `dmRollFor` nat-20/1 open-magnitude-die hook. `dev/verify-crit.mjs` 23/23; check-manifest OK (44 modules). *(In-play handshake render to eyeball at the next live Bridge session.)* **The system is now fully built — spec → lens oracle → engine.** Cross-refs in `DESIGN.md` (2026-06-23 rows), `DM-CHARTER.md` §6.6, `SPICE-CURVE.md` §3.

**PLACE GEN TABLE PASS — ☑ DONE 2026-06-22 (branch `feat/table-pass-place-gen`).** 9 tables rebuilt to full d100/d200 Commitment via workflow: Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations, Place Relevancy, Place Ruler Status (d100 each), Place Traits (d100, 4-col with calamity tied to trait), Place-Secret (d200, ~32% monster tie-ins). Originals in `zz_Archive/`. `tables.json`/`tables.js` recompiled — 332 clean tables.

**HOMETOWN BARDO — ☑ DONE 2026-06-22 (branch `feat/hometown-bardo`).** 3 Track-B beats (place-master-setting → place-history → place-mythology) slot into the bardo after Life and before world-genesis. First Track-B bardo integration. `data/creation-flow.js` (3 GUIDE entries) + `src/creator/bardo.js` (`buildBardoSeq`, `bardoSpine`, `bardoRollHometown`, `bardoHometownReroll`, `htMarkdown`, `bardoLog`, `renderBardo` hometown handler) + `src/world/play.js` (`bindWorld` seeds `world.seed.hometown` + canon Ledger entry) + `manifest.json`. `check-manifest` clean.

**NEW TRACK — DM Charter — ☑ v1 SPECCED 2026-06-22 → `docs/DM-CHARTER.md` (branch `feat/dm-charter`).** Adam: *"the slow drip is everything in D&D."* The scattered DM-side rules (Fragment veil, truth-behind-a-lie, three-options, over-reveal discipline, threat-signaling) are now consolidated into **one constitution** — authored from Adam's design questionnaire. Locked this session: the **single narrator voice** (bardo guide = waking DM, one entity across all lives), the Disco-Elysium **grim/severe/hilarious** persona, the slow-drip revelation chain, **honor-the-cool** danger, mechanics-felt-not-stated, motivated-lies-over-canon, **pre-generated world depth** (soft-until-contact), no-tonal-railroad, the content lines (sexual violence banned; child-harm theme-only/fade-to-black), and **patient-world** pacing with In-Media-Res escalation + cliffhanger-on-break. Decision rows in `DESIGN.md` (2026-06-22).
- **Draft tables shipped (flagged for the table-improvement pass):** `NPC Honesty` (2d10 bell, cannot-lie↔cannot-tell-truth), `NPC Trust Lever` (d20, what wins their trust), `Starting State - World Depth` (deep secrets + over-the-horizon threats). **NOT yet compiled** into `tables.json` — they're drafts; compile with the improvement pass, not before.
- **Build follow-ups (specced in `DM-CHARTER.md` §12, not yet wired):** the In-Media-Res escalation system; pre-gen World Depth at founding (roll → soft → lock-on-contact); wire honesty/trust/`analog` onto the NPC generator + the DM digest; build on `_NPC Quick All-Stars` for the `analog` field; the later **tutorial DM**.
- **Next concrete move:** a **testable persona system-prompt** stubbed from the Charter, run over the DM Bridge to *feel* the narrator before locking the text (then reconcile the `NEW-GAME-FLOW` bardo/waking voice split, §1).

Original scope (now covered by the spec):
- **Basic behaviors / agency:** never roll the player's dice, never decide the PC's actions, exert will only through NPCs, end each beat with a clean handoff, present three concrete options + "or something else" at decision points (existing `feedback_dm_agency` + `feedback_dm_three_options` — fold them in).
- **Secret-information handling:** the deterministic state layer holds **canon truth behind the screen**; the player sees only the **Fragment** (6–10 word sensory hook); the DM reveals the real row through narration at the right moment, never dumps DM-only lore (the **over-reveal discipline** already flagged — e.g. don't surface concretized Strange+ pressures, faction doom, or bardo-vision truths in opening choices). NPCs may **lie** only when motivated (Secret/Fear/Leverage) — a claim layered over canon, never a rewrite.
- **The slow drip (the core craft):** a reveal *cadence* — leak secrets gradually through clues, NPC tells, environmental/sensory detail, partial and contradictory information, and **earned** discovery; pace mystery so it sustains a long binge campaign (serves the anti-drift thesis + the hyper-attentive player). **Telegraph danger** before it kills (ties to `DIFFICULTY.md` threat-signaling — deathtraps must be foreshadowed). Escalate how much is revealed as the player digs / rolls well / spends time.
- **Integration:** this is the DM **system prompt / behavior contract**; align it with `EVENT-CONTRACT.md` (*detected > declared*; the DM emits typed events, the script owns state) and the digest the app already serves each turn (`handToDM`/`dmDigest`). The bardo visions, corpse rumors, and faction drift are all *slow-drip surfaces* the charter should say how to dole out.

**NEW TRACK — Death & Rebirth (the persistent-sandbox loop), specced 2026-06-21 → `DEATH-AND-REBIRTH.md`.** Design locked this session: death is expected (brutal-but-fair, telegraphed), the successor is a brand-new character on a world that *persisted and drifted*, the bardo gap is a 0–49 in-world-day bell roll, 14 peaceful/wrathful vision-rolls mutate the world against the dead PC's **Saga** (their 7 most significant entities) and surface to the player only as Fragments, faction proximity is class-weighted at creation, the corpse/loot decays by clock+context, and all worlds eventually share **one connected plane (Universe v3)**. Build order (full detail in the spec):
1. ☑ **Saga tracking — DONE 2026-06-21.** `src/world/saga.js` (`computeSaga`/`refreshSaga`/`sagaKey`/`SAGA_MAX`): derives a character's top-7 significant entities (enemies/NPCs/factions/places/threads) from the ledger + gazetteer + faction web, ranked by stake × frequency × recency. Stored on `c.saga`; seeded at `cgBind`, refreshed each `beginSession`, re-run at death before the visions. Registered (manifest + `<script>` + LAYER L2); `check-manifest` clean (32 modules); verified `dev/verify-saga.mjs` (12/12 logic) + full-app jsdom boot.
2. ☑ **Bardo gap + drift — DONE 2026-06-21.** `src/world/rebirth.js` (`rollBardoGap`/`bardoGap`/`BARDO_MAX_DAYS`): 0–49 in-world-day triangular bell (mode ~3–4 weeks) advances the clock + turns the faction web once per elapsed week (reuses `ssFactionTurn`), writes a `bardo` transition. New death-flow module; `check-manifest` clean (33 modules); verified 20/20 + jsdom boot.
3. ☑ **The 14 vision-rolls — DONE 2026-06-21.** `bardoVisions`/`rollVision`/`applyVision`/`runBardo` + `VISION_OUTCOMES` (draft flavor) in `rebirth.js`: 7 peaceful + 7 wrathful over the dead PC's Saga (padded to 7), each ~50% fires → mutates a faction clock / NPC+place `fate` / thread + writes DM-side truth to the ledger; player sees only the Fragment. `runBardo` orchestrates refreshSaga→gap→visions, stores `c.visions`. Verified 34/34 + jsdom boot. *Remaining:* surface `c.visions` as Fragments in the successor's bardo UI (with step 7).
4. **Faction proximity at creation** — class-weighted *This Is Your Life* table + active-factions roll; wire into `rollEntry`.
5. **Corpse & loot decay** — canon corpse object + clock×context recovery roll.
6. **Connected plane (Universe v3)** — schema migration (bank-and-restart `v2`→`v3`) + region placement on the shared hex plane. **Heaviest; last.**
7. ☑ **`fate.js` rework — DONE 2026-06-21.** Retired the d20 spawn-back; `killCharacter` stamps in-world `c.fellWhen` + writes death canon, `openBardo`/`renderBardoPassage` run `runBardo` and reveal the gap + 14 vision Fragments, `closeBardo` rolls a fresh successor. `#fateModal`→`#bardoModal`. Verified `dev/verify-rebirth-flow.mjs` (14/14). **The death loop is now playable end-to-end** within the per-world model; only the connected plane (step 6) remains for cross-region spawning.

4. ☑ **Faction proximity at creation — DONE 2026-06-21.** `rollFactionProximity`/`factionKind` (in `world-gen.js`, wired into `rollEntry`) + `METHOD_KIND`/`CLASS_FACTION_AFFINITY` data: relationship tie>member>none, faction picked class-weighted by archetype (any class/any faction). Records `c.entry.proximity` + a `canon`/`proximity` ledger entry, adds the faction to the opening as a Friend. Verified `dev/verify-proximity.mjs` (12/12).

5. ☑ **Corpse & loot decay — DONE 2026-06-21.** `killCharacter` mints `c.corpse` (items+gold + a rolled `context`/`decayDays`); `corpseStatus` decays fresh→disturbed→gone by elapsed in-world days; `corpsesAt`/`claimCorpse` + a "⚰ Recover effects" button (`recoverFallen`) let a living PC at the fall site take the haul before it's gone. In `rebirth.js` (now L2) + `fate.js` + `render.js`. Verified (saga 45/45, rebirth-flow 19/19).

6. ☑ **Connected plane — DONE 2026-06-21 (additive, non-destructive).** All worlds are now regions of one shared plane: `regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion` (`world.state`), `bindWorld` places each new region, `migrateAll` tags existing worlds + sets `U.plane.v3` (nothing reset/merged), `spawnSuccessorOnPlane` (`fate.js`) wakes the successor in the most distant region, shelf reframed as "Regions of the plane." Supersedes the spec's bank-and-restart with the safe additive path. Verified `dev/verify-plane.mjs` (14/14). Emergent: the bardo gap usually decays short-context corpses before anyone returns (only sealed/wild survive) — intended. *Deferred:* region-map SVG + coarse region-to-region travel.

**Death & Rebirth: ALL STEPS (1–7) DONE.** The full loop plays: death → world drifts + 14 visions → corpse decays → successor born (possibly sworn to a rival) in a distant region of the shared plane. Branch `feat/death-rebirth-saga`; verifiers: saga 45 · proximity 12 · rebirth-flow 19 · plane 14. Next: merge (run `/code-review` first) or polish (region-map SVG, authored vision/affinity tables, the icon assets).

This track and the Advancement track interlock (XP curve decided below feeds how *far* a typical life gets before death routes into this loop).

**⭐ SCOPED TO TIER 2 (2026-06-26) → `docs/TIER-SCOPE.md`.** This version caps at **Tier 2 (levels 1–10)**; T3/T4 deferred to a future expansion. The Advancement track below is now BUILT to the L10 ceiling (Phases A–E merged). Cap enforced in 4 layers (levelForXp clamp = primary). **Queued T1/T2 polish (none blocking):** the `wilderness-threat-identity-t1/-t2` tables (sample-review authoring pass); ~~the in-app level-up choice picker~~ ☑ BUILT 2026-06-26 (`src/creator/levelup.js`); CR 9–10 capstone density (~14 blocks); a live Bridge playtest. Deferred-but-inert: T3/T4 loot budgets + Legendary/Artifact (verify-guarded), Outlandish banding (L4), the 5 variants (L3b), CLASS_PROGRESSION L11–20.

**NEW TRACK — Advancement system (combat / XP / leveling), specced 2026-06-21; BUILT to L10 2026-06-26.** Design locked across four `system-spec` docs: `EVENT-CONTRACT.md` (the spine), `ADVANCEMENT.md`, `DIFFICULTY.md`, `COMBAT.md` (sketch). Build order:
1. ☑ **`CLASS_PROGRESSION` data, levels 1–20 — DONE 2026-06-21 (Claude Code).** `data/class-progression.js` (generated by `build/gen-class-progression.py`): 12 classes × 20 levels — `pb`, full-text `features[]`, caster `cantrips`/`prepared`/`slots` (full/half/pact) + Wizard `spellbook`, and class resource scalers. **Parse-then-validate** — parses the OCR'd `classes.md` grids, asserts spell-slots against canonical full/half/pact matrices; ASI/repeat/subclass-repeat levels injected from 2024 canon (summary table too OCR-corrupted). Registered (manifest + `<script>` + LAYER); `check-manifest` clean (30 modules); **797/797 headless jsdom**, incl. L1 reconciliation with `srd-creator.js`. *Out of scope (next):* subclass feature content, the threshold curve (step 2), leveling UI.
2. ☑ **XP threshold curve — BUILT 2026-06-26.** SRD 5.2.1 thresholds as the in-code canonical constant `XP_THRESHOLDS` (`src/engine/advancement.js`; full L1–20, `levelForXp` clamps to `LEVEL_CEILING=10`). Decision revised: a non-rolled SRD-canon lookup is a code constant (like `gen-class-progression.py`'s matrices), NOT the rolled-table compile pipeline — see `ADVANCEMENT.md` §Leveling.
3. ☑ **Event-contract plumbing — BUILT 2026-06-26.** `grantXp` accrues *detected* XP in `applyEvent` on the priced cases (front_closed/clock_fired/choice_logged-major/discovery/fact_canonized/objective-gated encounter_resolved) — never DM-declared. `awardXp`/`pendingLevelUp`/`levelForXp` in `advancement.js`.
4. ☑ **Rest-gated level-up beat — BUILT 2026-06-26.** `passTime` claims a pending level-up on any rest → `level_applied` → `applyLevelUp` (re-derives + GROWS HP/proficiency/slots/pools). The **in-app choice picker** (`src/creator/levelup.js`, BUILT + COMPLETE 2026-06-26) fires (`openLevelUp`) for the interpretive picks, with per-level deltas from `CLASS_PROGRESSION`; `applyLevelChoices` writes them and ripples HP/AC/PP + pool maxes. The picker is now **complete**: new cantrips/spells, the **subclass** reveal+record (`data/subclass-progression.js`), an **ASI-or-feat** slot (original IP-clean general feats in `data/feats.js`), and an optional **spell swap**. **A level-up can't be accidentally skipped** — a persistent `sheet.choicesLevel` marker + re-open banner + auto-open keep surfacing the picker until finalized (survives reloads). `dev/verify-levelup.mjs` 87/87; live-verified in-browser. (Open: feat set is a draft to balance-tune.)
5. *(Deferred to/with Fable):* combat engine + combat XP award values. (XP award values are draft constants now, tuned in playtest.)

**NEW TRACK — DM Bridge (dev integration harness) — ☑ v1 DONE 2026-06-21 (Claude Code) — `DM-BRIDGE.md`. ⭐ was Adam's flagged priority.** The game is now playable in development: Claude Code as the AI DM over a tiny local mailbox bridge (**no API tokens** — subscription-backed), replacing the clipboard loop. All five build-order steps shipped:
1. ☑ Contract locked + 4 fixture pairs (`dev/fixtures/`).
2. ☑ `dev/dm-bridge.py` — mailbox + static serve (stdlib).
3. ☑ App wiring — `src/world/dm.js` (`dmDigest`/`sendTurn`/`pollResponse`/`applyResponse` + the `applyEvent` runtime), `renderDMFeed` (the "The DM" chat panel), `dmLogOf`/`pushDmLog`, `GS.dm`. Registered; `check-manifest` clean (31 modules).
4. ☑ `/loop` DM runbook (in `DM-BRIDGE.md`).
5. ☑ Verify — `dev/verify-bridge.py` (28/28 transport+contract) + `dev/verify-dm-events.mjs` (21/21 full-app jsdom load: event runtime through real mutators + DM-feed render + boot smoke-test).

**v1 gaps left for follow-up:** (a) **no time-advance event** — clock still moves via the transition controls; a `transition_declared` event is the obvious next addition; (b) **declared-only events + fuzzy `clockId`** — promote to *detected* + stable clock ids with the advancement event-plumbing step; (c) **XP/leveling not computed** (events recorded to ledger only — `ADVANCEMENT.md`'s job); (d) UI is a simple chronicle — the lane-B column-slide polish can follow. **Now genuinely unblocks playtesting everything** — next session can drive a real session over the bridge and harvest friction notes.

Other open work below.

~~Track A, step 1–3~~ — ☑ done 2026-06-18 (spine built + verified in `genesis.html`).
~~O1 — the Entry bridge~~ — ☑ **DONE 2026-06-19** (Option C, 28/28 headless). The front-door scenario is now fully assembled by the script.
~~O2 — opening Fragments~~ — ☑ **DONE 2026-06-19** (world-genesis cards + pressures show the player a fragment; the DM gets the truth). **The opening now plays as designed: roll fragments → found → reveal.**

**NEW GAME = THE BARDO (spec'd 2026-06-19 → `NEW-GAME-FLOW.md`, pending sign-off).** Adam's reframe: starting a game is one *guided passage* — a script-voice spirit-guide walks the soul through creation (world → soul → threads), the player clicks a die per beat (tumble → SPICY juice → fragment), and at "open your eyes" the DM takes over. Script owns the bardo; DM owns waking life. This becomes the primary build track for the opening (supersedes O3's "sensory-first presentation" — it's folded in). **Next action: Adam reviews the spec; on sign-off, build per §7 (wizard shell + click-roll die/juice first, then Stage I as a vertical slice).** Next: **O3** (carry the `_START_New World` sensory-first ordering into the opening presentation), the **Wilderness Encounter port**, and the broader Fragment batch (fill the `fragment-slot` in the *compiled* `tables.json` so the Oracle + future ritual surfaces show fragments too). But first — **Adam is playtesting the opening.**
**Track B steps 4 + 5 are now ☑ done (2026-06-19)** — lean frontmatter stamped across all 754 files, and the compiler (`compile-tables.py`) parses + validates + emits `tables.json` (328 tables, 0 real coverage bugs). The census worry ("never fired through the engine") is now largely answered: **325/344 dice tables validate clean**; the handful of exceptions are categorized (3 minor "starts-at-2" content tables, special lore/modifier formats, lookup matrices), not blockers. **Track B step "wire the game to the compiled tables" — ☑ DONE 2026-06-19.** The compiler now also emits **`tables.js`** (a `window.GENESIS_TABLES` global — a `file://` page can't `fetch()` JSON but loads a `<script src>` fine, preserving the single-file/no-server design). `genesis.html` includes it and has a **dice-aware engine** (`rollExpr`/`rollTable` — handles flat dN, bell NdM, and mixed `d12+d8`) plus a new **Oracle tab** that rolls any of the 328 compiled tables (with spice "juice" chip + graceful guard if `tables.js` is absent). Verified headless: trinket rolls a true 2d20 bell (never a 1), region-encounter covers 1–20, urban-encounters 2–20. *(Note: the bespoke world-genesis / char-genesis / starting-state rituals still use their hand-inline data — they carry roll-chain / concretization logic the flat compiled format doesn't capture; migrating them onto the compiled layer is optional future work. The Oracle proves the pipe and makes the full corpus rollable today.)* **Remaining Track B: (b) step 6 Fragment batch** (fill the `fragment-slot` per row; start with the opening surface = O2), **(c) step 7 on-demand loading.** Pointer/cross-ref validation (loot → `magic-items.json`) is a future compiler enhancement. The change-over-time layer (10–13) is unblocked off the live ledger + clock, and **char-genesis already seeds it**. PC entry (14) is ☑ done.

## Next focus — flesh out the Character Creator walkthrough (planned 2026-06-20; COMPLETE 2026-06-21)

Adam wants to live in character creation for a good while. Goal: stop auto-generating choices the player should *make*; walk each through the spirit guide, keeping a "roll/pick for me" shortcut for the overwhelmed (the three-options-+-something-else ethos).

1. ☑ **Skills — DONE 2026-06-21.** New bardo `skills` beat: class skill choices (n-from-list per `CLASS_SKILLS`), **excluding** any the background already grants (2024 no-duplicate rule). "🎲 choose for me" auto-fills. Lands on the sheet as `classSkills` + merged into `skillProfs`.
2. ☑ **Equipment — DONE 2026-06-21.** New bardo `equipment` beat: starting-equipment A/B (plus Fighter's C / all-gold) packages from `CLASS_KIT`; player picks; `inventory` + `gold` populate the sheet.
3. ☑ **Spells — DONE 2026-06-21.** New bardo `spells` beat (caster-only): cantrips + L1 from `CLASS_CASTING` counts, filtered from `SPELLS_SLIM` by class/level. Non-casters get a graceful "no magic at level 1" pass; half-casters with 0 cantrips (Paladin/Ranger) handled. Lands as `cantrips`/`spells`/`spellAbility`.
4. ☑ **Origin feat — DONE 2026-06-21.** New bardo `feat` beat presents the background's origin feat and resolves its choice: **Magic Initiate** → 2 cantrips + 1 L1 spell from its list (with the right spell ability); **Skilled** → 3 skills excluding bg/class dupes; **Alert / Savage Attacker** → confirm. Data in `ORIGIN_FEATS`; lands on the sheet as `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility` (+ feat skills merged into `skillProfs`). (At L1 there's no ASI — that's a level-4 general feat, out of scope for creation.)

**Also DONE 2026-06-21 — multi-die roll display (UX backlog):** ability-score rolls now show the four d6 (dropped one struck through) in the bardo slots and a "YOUR ROLLS" strip on the manual Sheet. `roll4d6breakdown()` + `miniDice()`.

**Dependency / decision — RESOLVED 2026-06-21:** ship the SRD slices as **classic-script `<script>` globals** (`data/srd-creator.js` curated; `data/spells-slim.js` generated by `build/gen-spells-slim.py` from `spells.json`), **not** fetched from `SRD-Data/` JSON — `file://` can't `fetch()`; `<script src>` keeps the single-file/offline design (the `tables.js` constraint). Verified 62/62 headless (jsdom, real `genesis.html`); `check-manifest` OK (29 modules).

**Also queued (Track B sync):** mirror the 2026-06-20 Setting/Built Of regrade into the Engine markdown source + recompile `tables.json`; wire adventurer-surfacing rolls to draw from the Wandering Souls roster.

**Canon Wandering Souls (Adam, 2026-06-20) — DONE:** Adam's characters now ship as source (`data/souls-canon.js` → `CANON_SOULS`, seeded idempotently by `world.state.seedCanonSouls`); end-user souls stay local; roster = union. Brunn Graniteback is canon. **Queued follow-up — "Retire character" action:** an in-play analog of `bankSoul()` so a PC past the spirit-guide `found` beat can still be sent to the roster (today the only bank button lives on the `found` screen). Also consider locking the × remove button on canon souls in the shipped build.

**Fixed (2026-06-21):** the Sheet's "Best for class" no-op. Rolling auto-applied best, so the lone button re-applied the identical result and looked dead. Now an explicit **Best-for-class / As-rolled toggle** (active highlighted, like the bardo) — `cgScoreMode`/`cgAssignRolled` added to `creator.scores`; `cgSwap` marks mode `custom`. (`cgResetScores` is now unused — dead, harmless; sweep later.)

**UX backlog (Adam, 2026-06-20):** ~~*multi-die roll display.*~~ ☑ **DONE 2026-06-21 (ability scores).** `roll4d6breakdown()` keeps the four d6 + which was dropped; the bardo score slots and the manual Sheet's "YOUR ROLLS" strip render them via `miniDice()` (dropped one struck). *Open generalization:* the same per-die treatment for other multi-die rolls (bell tables / 2d20 trinket via the Oracle, world rolls) still goes through the single-die `dieRoll` FX — extend if desired. (Banking a rolled PC as a Wandering Soul: confirmed working & liked.)

## Modularization migration order (planned 2026-06-20)

Carve in dependency order; run `build/check-manifest.py` + a load test after each step. Register every new file in `manifest.json` (the check fails on orphans/drift).

1. ☑ **Pass 1 — index spine:** manifest.json + build/check-manifest.py; data: character-genesis, names; logic: engine.core.
2. ☑ **Pass 2 — data layer (2026-06-20):** `data/world-tables.js` (T + FRAG), `data/starting-state.js` (SS, SS_CONC, EB), `data/species-backgrounds.js` (ABIL, ABIL_LABEL, CLASSES, SPECIES, BACKGROUNDS, TIP). Monolith 2047→1547 lines; check-manifest OK (7 modules, 19 owned symbols); headless load-test confirms the data↔logic seam (rollTbl/ebRoll/fragAt/abilMod run off the carved data). One local shadow renamed: `const T=CT()` in `fillOracleList` → `CTB` so owning `T` stays drift-checkable. *(No `BG_PKG` const existed — dropped from the plan.)*
3. **Logic by domain (in progress):**
   - ☑ **`src/engine/` (2026-06-20)** — `tables.js` (rollTbl, fragAt, ebRoll, concretize), `world-gen.js` (rollFaction, rollPressure, rollStartingState, entrySeeds, pickTension, rollEntry, ssFactionTurn), `hexmap.js` (HEXW/BIOMES/COMPASS + hashCoord/axialRound/worldToAxial/axialToWorld/hexDist/terrainAt/nodeXY/setNodeXY/placeTravelNode). Monolith 1547→1417 lines; check-manifest OK (10 modules, 42 symbols); headless roll-chain test passes (rollStartingState → 4 factions + 2 pressures + 12 ledger entries; rollEntry fills the bundle; terrainAt + axial geometry verified). **`renderHexMap` (the SVG paint) stayed in the app** — it's a render concern, carve it with `src/world/` render. **`abilMod` stayed in the app** — carve it with `src/creator/` (it's a char helper).
   - ☑ **`src/creator/` (2026-06-20)** — 70 functions AST-extracted into 5 seams: `scores.js`, `life.js`, `sheet.js`, `bardo.js`, `roster.js`. Functions only; all top-level consts/lets stayed app-owned (avoids the `WORLDBEATS=STAGES` load-order TDZ). Monolith 1092→668; check-manifest OK (21 modules, 163 symbols); jsdom drives all tabs + the live bardo creator flow. **Step 3 (logic-by-domain) COMPLETE.**
   - ☑ **App core (2026-06-20) — DE-MONOLITHING COMPLETE.** 22 fns AST-carved into `src/world/play.js` (world-flow), `src/world/fate.js` (death), `src/world/handoff.js` (DM export). `genesis.html` is now a **449-line shell** (HTML/CSS + init + 6 consts/lets, zero functions). **25 modules, 185 symbols, check-manifest clean.** jsdom: boots clean, all tabs, world-genesis ritual runs.

**Full modularization arc: monolith 2047 → 449 lines (~78%), 1 → 25 modules, passes 1–8. The de-monolithing is done.**

**Remaining polish / future (see SCALING.md):**
- Move `STAGES` to a data module (then `WORLDBEATS`/`GUIDE`/`LIFE_STEP` can follow; `WORLDBEATS=STAGES` is the load-order constraint); `FATE_THRESHOLD` → `fate.js`.
- Clean the 6 layer-inversion warns (`world.state→renderWorld`/`toast`, `creator.scores→renderCharge`, creator `sheet`/`roster`→`showTab`/`toast`), then flip the layer-check to hard-error.
- ES-module migration + 59 inline-handler rebind: ride in WITH the eventual graphics engine, not before.
- Feature backlog (separate from carve): multi-die roll display; "retire character" action; deeper creator skill/spell selection.
   - ◐ **`src/world/`** — ☑ **state.js (2026-06-20)**: persistence (KEY/loadU/saveU/activeWorld), clock (clockOf/fmtTime/timeOfDay/fmtClock/fmtClockFull/advanceClock), reveal-curve (REVEAL_KEYS/isRevealed/allRevealed/reveal/showAllPanels), ledger (ledgerOf/addLedger), map (BEARINGS/mapOf/addNode/nodeName/findEdge/addEdge/rollRoute), migration (migrateWorld/migrateAll). The live mutable globals **`let U` + `let SEED` stayed app-owned** in genesis.html (read/written at call-time). Monolith 1417→1342; check-manifest OK (11 modules, 71 symbols); headless test verifies clock math, write-once edges, ledger append, slug, saveU persist. ☑ **render.js (2026-06-20)**: renderWorld/renderHexMap/renderMap/renderLedger/renderOpening/renderPowers/renderStart/renderShelf → `src/world/render.js`. Scattered functions AST-extracted by exact offsets (acorn); all 8 verified **byte-identical pre/post** (pure carve, no behavior change). Creator renders (renderBardo/renderCharge) stay with the creator. Monolith 1279→1092; check-manifest OK (15 modules, 91 symbols). **Verification upgrade:** jsdom now executes the real genesis.html with all modules loading in order — every tab drives without throwing, and a world rolled in the browser-like context (2 factions/2 pressures/6 ledger, valid `<svg>`) proves cross-module `const` sharing holds in a real DOM, not just node vm.
   - ☑ **`src/ui/` + `engine/compiled` (2026-06-20)** — split the Oracle cluster correctly: `src/engine/compiled.js` (the Track-B compiled-tables dice engine: `CT`/`rollExpr`/`rollTable` — distinct from `engine.tables`, which rolls the inline-data tables), `src/ui/oracle.js` (`ORC`/`ORC_SPICE`/`oracleRoll`/`fillOracleResult`/`fillOracleList`/`renderOracle`), `src/ui/chrome.js` (`showTab` + `toast` + `toastTimer`). Monolith 1342→1279; check-manifest OK (14 modules, 83 symbols); compiled dice engine verified headless (d6 in-range, d12+d8 floors at 2, unknown→null, rows resolve). Oracle/chrome DOM render is browser-verified. The app-init tail (`migrateAll();` / `renderWorld();` / `showTab('start');`) stays in genesis.html.
4. **SRD-as-JSON for the creator** (skills / A-B equipment / spells fetched over localhost) — the original trigger; do once the data layer is modular.
5. **Deferred:** ES-module migration (needs inline onclick → addEventListener rebind); production build → single self-contained offline file.
