---
type: design-doc
branch: Genesis
status: living
created: 2026-06-17
updated: 2026-06-18
canonical: true
related:
  - "[[genesis.html]]"
  - "[[GAP-ANALYSIS]]"
  - "[[table-registry]]"
  - "[[README]]"
---

# Genesis — Design Doc (canonical)

This is the source-of-truth design doc for the Genesis branch. `README.md` is a short orientation pointer; this file holds the thinking. Update this in the same change as any architectural decision.

## Vision

A **solo journaling RPG with an oracle engine + AI GM**, built on the Arcana Engine. The player rolls a world into being, then lives in it; Claude DMs. Distinct from "AI tells you a story" (crowded) by putting the dice — and the world-building — in the player's hands, with the Arcana Engine as the oracle and Claude as the interpreter. Distinct from the Shifting Vale campaign by being the player's *own* persistent universe rather than an authored one.

## North star — anti-drift (the reason this app exists)

AI is excellent for one-shots but **drifts over long campaigns**, and a player on a two-week binge is hyper-tuned to that drift. Genesis is the architectural answer: **the deterministic state layer is authoritative; the AI is the interpreter, never the source of truth.** Facts live in the World State Ledger + node-graph + generators; the AI turns *current* state into prose and may be forgetful or wrong without the world losing coherence. **Maximize what the script serves** (state, geography, generators, rolls, clocks, canon) — for any feature, ask *"can the script own this?"* before *"let the AI handle it."* Grounding is **cheap, scoped, and constant**: each beat the app serves a small, relevance-scoped state digest so the AI is continuously re-anchored without re-deriving or holding the whole world. This is the *why* under "established = write-once canon" and "the world is the save file." Full spatial expression: `SPATIAL-MODEL.md`.

## Locked decisions (2026-06-17)

| Decision | Choice |
|---|---|
| Relationship to Shifting Vale | **New branch, alongside** — not a replacement |
| Name | **Genesis** |
| Persistence unit | **The world is the save file.** Worlds persist forever; accumulate into a **universe**. Only explicit "destroy" unmakes one |
| World scope | **One active world at a time**, universe holds many; multiworld travel is a future door |
| Reveal model | **Sparse seed, grown by play** (space) — genesis rolls a skeleton; travel rolls new corners on demand. **Lazy history** (time) — the past is unwritten until the player inquires, then rolled and made canon. Both written permanently into the gazetteer/ledger |
| Hidden layer | **Yes, narrow.** Player rolls discovery openly; DM holds the *truth behind a lie* and the *NPC motive-to-lie check* behind the screen. (Reintroduced by the lying mechanic — lying needs someone holding the real answer.) |
| World clock | **Visible running clock** (Disco Elysium / Bethesda style) — an in-world day/time HUD. Time does NOT tick in real time; it advances only via **DM-declared transitions** (travel / rest / montage), scenes being elastic/frozen. Two counters: a **session counter** (+1 on "Begin Session") and the **in-world clock** (moves on transitions). Drift/aging keys off **in-world elapsed time**, not session count. *(Updated 2026-06-18 — supersedes the earlier "ticks in play sessions" framing.)* |
| Truth & lies | **Once established, it's canon** (write-once truth, recorded in the ledger). NPCs may **lie**, but only when motivated (fear / manipulation / a secret at stake) — motive-gated, so it stays rare. A lie is a *claim layered over* canon, never a rewrite of it |
| Conversation & combat | All conversation runs through **Claude** (app = ledger + oracle; chat = social/narrative surface). **Combat is parked for Fable** — freeform, DM-adjudicated on player choices until a system exists |
| Rules posture | **Stock 5.5e as much as possible.** No invented mechanics; lie-detection etc. = standard rolls (Insight). Bend rules only **reactively** when a concrete playtest issue forces it (the "BG3 bent rules to fit the engine" model), never speculatively — and **log every bend** (see §Rules posture). DM-style rulings that aren't strictly RAW become logged micro-precedents for cross-session consistency |
| Death | Not the end. Fallen character rolls **fate (d20, 11+)** for a chance to spawn back into the adventure they died in; else the world moves on |
| Player-facing oracle layer | **Vague — "Fragment" style** (sensory hook, 6–10 words, no naming). Player sees the fragment; DM sees the precise row and weaves. Drop to Keyword for secret/hook rows |
| Build tooling | **No Vite.** Single-file vanilla HTML; a ~30-line Node parser only when data outgrows inline |
| Cost posture | Tier-1 play (Cowork chat) = no metered cost. Tier-2 API later: ~$0.25–0.40/hr Sonnet lean+cached |

## Locked decisions (2026-06-18)

| Decision | Choice |
|---|---|
| Product framing | **Genesis is its own standalone product** — a single-player TTRPG video game, not a harness on the human-DM vault. The Arcana Engine vault is a **content source** (mine tables from it) and a **back-port target** (tables invented here can be reconciled upstream later) |
| AI DM narrative | **DEFINITIVE: there is an AI DM, and it narrates.** It synthesizes prose to the player, using the tables to shape what it says. "Open rolls / no hidden DM screen" means **dice transparency** (the player rolls in the open) — NOT that the DM is silent. Supersedes any "AI never narrates" language inherited from the human-DM vault docs |
| Fragment oracle | **Locked as the default presentation** for player rolls. Player rolls openly → sees a 6–10 word Fragment → the AI DM reveals the actual row through narration (already chosen 2026-06-17; now the default) |
| Spice Curve | **Emergent, not engineered.** Five-band intensity ladder (Grounded / Textured / Strange / Volatile / Mythic) as honest per-table rarity. A spicy roll → spicy outcome → written to the World State Ledger as permanent flavor. **No `spiceTemp` / time-escalation dial. No tonal railroad** — players may build a rainbow utopia; tone-agency is sacred. Full spec: `SPICE-CURVE.md` |
| Spice juice | Spicy rolls fire playful **per-band exclamations + animations** (Strange "Bizarre…", Volatile "Otherworldly!", Mythic "SPICY!!"). Intensity is celebrated player-facing; row **content stays hidden** behind the Fragment — anticipation, not spoiler |
| World State Ledger | **The single home for ALL change-over-time information** — the clock/transition log, canon facts, **spatial facts**, faction clocks/agendas, per-place drift, NPC life-events, and persisted spicy outcomes. The spine of the persistent world |
| Spatial / map layer | A **primitive node-graph** — places = nodes, traveled routes = weighted edges (rough bearing + travel-time). Spatial facts are **write-once canon in the ledger**: once a route's distance/time is set it's never silently contradicted. The graph *is* the map (visual rendering later). **Paradoxes are licensed only when world-state demands** (Mythic / shifting geography). Substrate for drift, travel-encounters, and reincorporation. **Extended 2026-06-19 → `SPATIAL-MODEL.md`:** node-graph = the **cognition** layer (what the AI reasons in; never holds the grid); a **lazy deterministic hex substrate** (unbounded fraying plane, terrain = `hash(seed,coords)`, never stored / never in AI context) = the map + geometry; travel stays **scene-to-scene** — the Wilderness Encounter Generator produces the journey (terrain feeds it, distance scales it), **not** a hex-crawl |
| Character creation | **Two interlocking layers, resolving the `(a)/(b)/(c)` fork as `(c)` hybrid.** **The Sheet** — guided SRD L1 build (player chooses species/class/background, rolls scores **4d6 drop lowest** openly, engine computes cheap derived numbers, heavy feature/gear/spell text stays a **`SRD-Data` pointer**). **The Life** — Xanathar's **"This Is Your Life"** biographical roll-chain (retires the flat `SPARK` + the proposed Want/Fear spine; player rolls openly, DM guides). The two interlock via class+background. Backstory people/threads **auto-seed the World State Ledger as write-once canon**, tagged to the originating soul (character-genesis *seeds the world*). The same ritual generates the **successor** on a successful fate roll. Full spec: `CHAR-CREATION.md`. **IP (resolved 2026-06-19):** the biography suite is genericized — original IP-clean spice-graded prose (`Life & Origins.md` + inline `CG`), XGE archived heritage-only; backgrounds expanded to **19** (4 SRD + 6 native + 9 standard archetypes rebuilt IP-clean). Score assignment is drag/tap-to-reassign (best-by-class default). **Walkthrough fleshed out (2026-06-21):** the auto-generated picks are now *walked* — after scores, three guided beats let the player choose **class skills** (n-from-list, minus background dupes per the 2024 no-duplicate rule), **starting equipment** (A/B/gold packages), and **spells** (caster-only: cantrips + L1; non-casters pass gracefully), each with a 🎲 "choose for me" shortcut. Choices land on the sheet (`skillProfs` merges bg+class; `inventory`/`gold`/`kit`/`cantrips`/`spells`/`spellAbility` added) via shared `cgSheetExtras()`. A fourth beat (**feat**) walks the background's **origin feat**: Magic Initiate resolves 2 cantrips + 1 L1 spell from its list; Skilled resolves 3 skills (excl. bg/class dupes); Alert/Savage Attacker confirm (`ORIGIN_FEATS`). No ASI at L1 (level-4 general feat). **Multi-die display (2026-06-21):** `roll4d6breakdown()` keeps the four d6 + dropped die; the bardo slots + manual Sheet show them (`miniDice`). **Data decision (resolved 2026-06-21):** the SRD slices the creator needs ship as **classic-script `<script>` globals** (`data/srd-creator.js` hand-curated; `data/spells-slim.js` generated from `spells.json` by `build/gen-spells-slim.py`), **NOT fetched from `SRD-Data/` JSON** — a `file://` page can't `fetch()`, and `<script src>` preserves the single-file/offline design (same constraint that drives `tables.js`). |
| Data: edit-source → compile-artifact | **Markdown tables are the editable source of truth; compiled JSON is a generated build artifact the engine runs.** Adam authors/curates in tables (human-readable, hand-editable); a compile step emits the runtime JSON for speed. **Division of labor:** the engine does all deterministic mechanical work (rolling, weighting, roll-chain fan-out, state); the AI does *only* the DM's interpretive job — reading roll results against current situation + world state and narrating. **Drift discipline (load-bearing):** compiled JSON is NEVER hand-edited; the compiler stamps each artifact (source path + hash + timestamp) so staleness is visible. **Compile = validator:** the build fails loudly on dangling references (a table pointing at a nonexistent spell/item) and emits a coverage report (what's referenced vs. orphaned). Generators hold *pointers* into reference data (`cast: Fireball` → `spells.json`), resolved/validated at compile time — they never duplicate definitions. This formalizes Track B's per-table-frontmatter → `tables.json` step as the general pattern |

These build on — and where noted, update — the 2026-06-17 decisions above.

## Locked decisions (2026-06-19)

| Decision | Choice |
| --- | --- |
| Entry bridge (the opening scenario) | **The opening is assembled from canon, not freshly rolled.** The PC↔world bridge (`rollEntry`, Step 3 of the Starting State procedure) builds a **5-slot opening bundle — Enemies / Friends / Complications / Things / Places** (Dungeon-World convention) by **preference order: PC backstory seeds → factions → pressures → fresh roll.** Most dice already happened (char-genesis seeds + world-genesis factions/pressures); the bridge *harvests* them. Standing binds to the **actual dominant faction** and routes it to Enemies vs Friends by whether Standing is adversarial; Why-Here derives from a search-thread when present; promoted backstory NPCs are **anchored to the entry location** as canon so the DM can reach for them. |
| Empty-slot policy | **Option C — the script always fills.** Any slot still empty after canon is filled from dedicated **fresh d100 tables** (`EB` inline / `Starting State - Opening Bundle.md`), so even a blank-slate PC in a thin world gets a fully realized opening. Empty slots are **never punted to the AI** — this is the anti-drift north star applied to the front door (the script serves the state; the AI only interprets). |
| Opening Bundle spice | **Spice-graded per `SPICE-CURVE`** — the fresh tables are **Commitment-class** (the class allowed to roll Volatile/Mythic), honest static rarity `1–66 Grounded · 67–86 Textured · 87–95 Strange · 96–99 Volatile · 100 Mythic`. So the opening can deliver real curveballs (a bound fiend, a revenant, a rift opening, a shard fallen from the sky, a small local god, a world-rewriting artifact) — but rare by the dice, never a dial. Band drives player-facing **juice** (Strange "Bizarre" / Volatile "Otherworldly" / Mythic "SPICY" chips in `renderOpening`); row content stays the DM's to reveal (SPICE-CURVE §5). |
| Opening Tension selection | **Selected, not random:** `pickTension` = **connects-to-PC** (a faction-sourced pressure when the PC stands adversarial to the local power) → else **higher-spice** (a concretized Strange+ pressure) → else the **internal** (local, immediate) one. At founding all clocks are equal, so "nearest-to-firing" reduces to this rule. (Refinement open: match backstory tags, not just adversarial standing.) |

| Table frontmatter schema | **Lean YAML, stamped corpus-wide (2026-06-19).** Every file under `Engine/03. _Tables/` + `Asset Library/` (754 files) carries frontmatter: `id` (the `^block-anchor`, pinned, never renamed) · `type` (`table`/`table-set`/`name-bank`/`creature`/`adventure`/`encounter`/`faction`/`manual`/`stub`) · `domain` (from path) · `status`; plus on tables: `table_class` (Spark/Fork/Commitment spice ceiling) · `player_facing` (reveal/plumbing) · `voice_critical`. **Lean = die/rows/spice are DERIVED by the compiler from the body, never stored** (no drift; the edit-source→compile-artifact rule). Judgment fields (class/player_facing/voice) were heuristic-seeded → flagged for review (`outputs/stamp_review.csv`). Enforcer: `Engine/00. _System/stamp-frontmatter.py` (idempotent, additive, body-safe — monster custom tables untouched); schema doc + new-table template: `Engine/01. _Templates/_Table Frontmatter Schema.md`. This is Track B step 4's prerequisite — the metadata layer the compiler reads. |

| New Game = the Bardo (guidance model) | **Starting a game is one guided passage with a definite start and finish, not a dashboard.** A **script-voice spirit-guide** walks the soul through the *bardo* (the whole creation walkthrough — world → soul → threads), explaining each beat; the player **clicks a die** to roll (tumble → band "juice"/SPICY → Fragment). At the final beat the character **"opens their eyes" and the DM (Claude) takes over** for waking life. **Locked split: script owns the bardo (deterministic/offline/free); the DM enters only at incarnation** and narrates the opening scene from what was rolled — the fragments resolve into fiction. Honors anti-drift (script serves state) + Tier-1 zero-cost. **Resolved (2026-06-19):** reroll = **3 "turnings-back" total** for the whole passage (per-beat spend, shared budget — discovery over save-scum); returning players get **three thinning guide registers, the third looping forever**; the guide frames choices *and* rolls; DM enters only at waking. **REVISED after playtest 2 (2026-06-19):** order is now **`soul → sheet → life → world`** (craft the soul, *then* it incarnates into a world that forms around it — **supersedes the earlier World→Soul order**); "The Trouble at Hand" is the **last** world reveal (the hook into play); **ALL of creation is one-choice/one-roll-at-a-time guided** (no menus — the Sheet's species/class/background become single guided choices with tooltips; scores = 4d6-drop-lowest rolled one ability at a time, then "best for class"; the Life rolls one at a time). Full spec + build order: `NEW-GAME-FLOW.md` §Revision + §9. |
| Interface: chat-first | **Genesis is mostly a DM chat with beautiful text animations — not a tabbed dashboard (Adam, playtest 2).** Universe/World/Oracle tabs are not front-and-center. A **left-hand nav rail** holds menus (BG3-style), collapsed by default; **opening a menu slides chat into a right-hand column** (Disco Elysium two-pane) so players can pin spells/actions. The Curve of Revelation governs which menus a first-timer sees. The bardo stays a focused full-screen passage that dissolves into this chat-first shell at waking. Substantial shell redesign — own build track after the creation reshape. Spec `NEW-GAME-FLOW.md` §9. |
| Advancement / XP (2026-06-21) | **One ledger-spine XP economy** — XP is earned by *resolved tension* (World State Ledger changes); combat is a **modifier on tension-resolution**, not a parallel pool. Combat XP is gated to objectives (raw kills barely pay) so grinding is inefficient and a fixed world's finite targets self-limit it. **Leveling = XP thresholds**, applied **on a rest** (short rest enough), re-walking the creator beats. **Creativity is off the XP axis** — rewarded via Inspiration (SRD, capped), better/efficient outcomes, and failure-as-engagement. Full spec: `ADVANCEMENT.md`. |
| Difficulty / world response (2026-06-21) | **Fixed by default, scaled by narrative exception.** Regions have a fixed `power_band` (guards stay guards even vs a level-12 PC); a `corruption_vector` can scale a region only when the fiction earns it. **No global level-scaling** — so the world **must telegraph danger** (danger-fragments) to make flee/fight/clever-out an informed choice. Murder-hobo is a playstyle the world *answers*, not prevents: typed `kill` events (`victimClass`) accelerate faction clocks → **discrete named responses** (bounty/inquisitor/nemesis), never a continuous difficulty dial. Full spec: `DIFFICULTY.md`. |
| Combat model (2026-06-21, sketch) | **Theater-of-mind, zone-banded, 5.5-faithful.** Range bands (Melee/Near/Far/Out) map to 5.5 distances; cover (half/three-quarters/full → AC + saves) and adv/disadv come from **generator terrain specs**. The objectified scene serves tactics, escape routes, and the "miraculous out" at once. Combat is the subsystem most entangled with Fable — engine deferred, but its **event surface** (`encounter_resolved`/`kill`) is specced now so advancement/difficulty can build against it. Spec: `COMBAT.md`. |
| DM↔script event contract (2026-06-21) | **The DM never invents a number — it emits typed events; the script owns state and computes consequences.** Core principle: **detected > declared** (prefer events derived from observed state deltas over DM self-reports; migrate declared→detected over time). DM adjudications on undetermined situations are logged as **canon precedent** so rulings stay consistent. The anti-drift thesis applied to advancement; the spine the advancement/difficulty/combat specs reference. Full spec: `EVENT-CONTRACT.md`. |
| Docs organization (2026-06-21) | **All design docs/specs/operational notes live in `docs/`** (`Obsidian Files/Genesis/docs/`); only `README.md` (front door) + `table-registry.md` (build artifact) stay at root. Normative mechanics docs are classified `type: system-spec`; `DESIGN.md` stays the decision registry (index; specs hold detail). Paths inside docs are repo-root-relative. Index: `docs/README.md`. |

These build on the 2026-06-18 Starting State decisions; verified 28/28 headless 2026-06-19.

## The registry is the design spine

`table-registry.json/.md` (270 active tables, ~18.8k rows, 11 archived) started as a discoverability fix but is becoming the backbone. Three independent needs all resolve to **per-table flags in the registry**:

- `voice-critical` (bool) → routes fragment generation to the right model (see §Model routing).
- `playerRoll: reveal | plumbing` → decides which rolls reach the player's hand vs. auto-resolve (see §Anti-tedium).
- load-on-demand → the DM loop pulls only the rolled table into context, keeping per-turn cost low.

One index, three problems. Future enrichment of the registry (purpose, trigger-condition, these flags) is the highest-leverage non-build work.

## Solutions to open problems (recorded 2026-06-17)

### 1. Model routing for fragment generation — Sonnet default, Haiku for plumbing
Cost is a near-non-factor (one-time batch, 50% off — even all-Sonnet is single-digit dollars). The real axis is **taste**: fragment-writing is literary judgment, where Sonnet/Opus beat Haiku, and the asset is permanent (seen thousands of times). So: **Sonnet default; Haiku only for plumbing tables** where the fragment is functional (loot composition, door state, footing). Route via `voice-critical`. **Decide empirically** — A/B the same 30-row table Haiku vs Sonnet side by side before committing the batch. Don't optimize for the cheaper model; it's a false economy here.

### 2. How the Dungeon/Urban/Wilderness generators wire in
These are the **interior generators** — the depth layer beneath the "Travel to a new place" button. When the player enters a city / ruin / wild, fire the matching generator; its output becomes a permanent gazetteer sub-place.

Fleshed-out ranking (by registry, corrects the earlier guess): **Urban is densest** — 71 tables / 5,749 rows (deep Segment suite); **Dungeon** 62 / 4,501; **Wilderness** 22 / 3,050. Procedures exist for all three (5-Room Dungeon Generator v3.1 / "Segmented Dungeon Kit", Urban Set Up / Encounter v2.5, Wilderness Set Up / Encounter v2.0, Travel Procedure v1.0).

Integration fork (Fable-sized, deferred):
- **(a) Port the roll-chain into Genesis JS + `tables.json`** — self-contained, the right long-term answer, and the prerequisite for the **SVG map** (the dungeon kit already carries topology / area / exit / door tables → node-and-edge rendering is genuinely close).
- **(b) Keep running them in Obsidian/Templater and import the sketch** — faster bridge, but couples Genesis to Obsidian permanently.
Recommend (a) when Fable's back; the map is the payoff.

### 3. The 100-roll problem — generation ≠ discovery
A full dungeon is 100+ rolls because the kit is a **DM-prep artifact** (roll the dungeon *before* a session). Tedium = using a prep tool as a play tool. Fix isn't fewer rolls; it's stop front-loading:
- **Split generation from discovery.** The app does all 100 rolls instantly and invisibly on entry (free JS), stores the dungeon, then *reveals* it room-by-room as the player moves. Generation is a hidden event; discovery is the game. The dungeon unfolds (same motion as the map filling in).
- **Only reveal-worthy rolls reach the player's hand** (~8–12 of 100: "what's through this door," "what's the secret," "what do you smell"). The rest are plumbing the app auto-resolves. One player roll = one beat; behind it the engine fans out the sub-tables. Player *feels* ten rolls; engine did a hundred. The dungeon kit already encodes this ("Setup — roll once, may be player-rolled for agency" vs per-segment rolls).
- **Combined with the fragment layer:** the player's one evocative roll surfaces a fragment ("damp, something breathing"), silently triggers the hidden sub-rolls, and Claude weaves the rich room. One roll → a full room → narration.

Friction to hold: hiding rolls trades **tactility for flow**, and the crunchy-DM archetype likes seeing dice. So `reveal | plumbing` is a per-table knob, not a global default.

## Time, truth & lies (decided 2026-06-17)

**Time symmetry.** Space grows by *travel*; history grows by *inquiry*. Same lazy-evaluation: the past is unwritten until the player asks about it, then it's rolled, coherence-checked against existing canon, and recorded forever. **World time** advances only during active play, via DM-declared transitions (travel / rest / montage); a session counter tracks real sessions while the in-world clock tracks fictional time, and drift keys off in-world elapsed time (see Locked decisions 2026-06-18).

**Two-layer fact model** (reconciles "established = canon" with "NPCs lie"):
- **Canon truth** — the real fact. Once established (by roll or play), fixed. The ledger writes it *immediately* so a later inquiry retrieves rather than re-rolls (this is the discipline that prevents contradictory pasts).
- **Claim** — what an NPC *says*. May diverge from truth when motivated. Canon records *the truth* + *the fact that "NPC X told the player Y."* A lie layers over canon; it never rewrites it. If the player never verifies, Y is their working belief while Z stays true underneath. Catching the divergence (contradiction or a successful read) becomes its own canon beat.

**Lying is motive-gated, not random** — fires only when the player's question touches an NPC's Secret / Fear / Leverage / "If Cornered" (tables that already exist — the lying mechanic mostly wires into the existing NPC suite). This self-limits frequency to "only when they have reason." New piece to add later: a small **"tell"** table (does the lie leave a crack catchable via Insight against the DM).

**Hidden DM layer** (narrow): truth-behind-a-lie and the motive-to-lie check are DM-side, behind the screen. Everything else the player rolls openly.

## Rules posture (decided 2026-06-17)

**Stock 5.5e baseline.** No invented mechanics; standard rolls for everything (Insight to read a lie, etc.). DM-style choice fills the gaps, as at any table.

**Bend only reactively, and log it.** Rules get bent only when a concrete playtest issue forces it (the BG3 model — change rules to fit the engine, *after* hitting the wall, not before). Each bend is deliberate and recorded. Speculative pre-bending is the trap.

**Rulings → micro-precedents.** Because the world persists, any non-RAW ruling I make becomes a logged precedent so I rule the same way next session (cross-session consistency = "established = canon" applied to rulings, not just facts).

**Rule-bends ledger** (append as they arise — empty until the first real one):

| Date | Issue hit | RAW says | Bend | Why |
|---|---|---|---|---|
| — | — | — | — | — |

## Cost model

- **Rolling, universe, gazetteer, fate, visuals, generation** → client-side JS. Free, instant, offline. `localStorage` key `genesis-universe-v2`.
- **DM weave** → Claude. Tier 1 (now): "Hand to your DM" clipboard → Cowork chat, subscription, no metered credits. Tier 2 (later): page calls Anthropic API with a key — only path that bills per-token. Pricing (Jun 2026): Sonnet 4.6 $3/$15 per M; Haiku 4.5 $1/$5; Opus 4.8 $5/$25; caching ~90% off cached input.
- **Fragment batch** = one-time, pay-per-table-wired (~2–3k rows for the tables Genesis actually fires = sub-$1 Haiku / single-digit Sonnet).

## Build state — the World Spine is live (2026-06-18)

Track A is built and verified in `genesis.html`. The persistent skeleton now exists:
- **World State Ledger** (`world.ledger`) — append-only; `addLedger(w,type,data,text)` is the single write path. Live types: `canon`, `transition`, `spatial`, `session` (plus reserved `clock`/`drift`/`npc-life`/`outcome` for the change-over-time layer).
- **In-world clock** — `world.clock {day,min}`, advanced *only* by transitions (`advanceClock`); `world.session` counter. HUD in the world header.
- **Node-graph map** — `world.map {nodes,edges}` + `world.currentNodeId`. Travel creates a node + a write-once weighted edge (bearing/travelMin/leagues) and advances the clock. Primitive SVG render in place; geographic layout deferred.
- **Migration** — `migrateWorld`/`migrateAll` upgrade legacy saves additively on load (idempotent, no loss).

Known seam (deferred, logged in `NEXT-STEPS.md`): `world.log` (prose Chronicle) and `world.ledger` are still parallel stores — collapse the Chronicle to render *from* the ledger in a later pass.

## Open threads / parked

- **Gap analysis** → see `GAP-ANALYSIS.md` (drafted 2026-06-17). Headline: the engine is a *snapshot generator*; persistence needs *change-over-time* generators.
- **PC entry / generator** — ☑ **RESOLVED + built 2026-06-18.** Two-layer Character Genesis ritual shipped in `genesis.html` (The Sheet + The Life / XGE "This Is Your Life"), spec in `CHAR-CREATION.md`, source tables in `Engine/03._Tables/04. Character Genesis/`. Genericized + expanded 2026-06-19 (19 backgrounds, IP-clean biography suite, drag-reassign scores). Remaining follow-ups: Standard-Array/Point-Buy score alternates; in-app caster/gear pickers; wire the tables into the Track B `tables.json` pipeline.
- **Registry enrichment** — add purpose / trigger / `voice-critical` / `playerRoll` flags.
- **Multiworld travel** — data-model door open; no mechanic.
- **Own skill** — Genesis still rides `arcana-playtest` (opposite, canon-protection instincts). Split once shape settles.
- **Build sequence & ordered execution:** see `NEXT-STEPS.md` (the running ordered plan). High level: foundation (World State Ledger incl. clock + node-graph map) → table machine-indexing (registry enrich + per-table frontmatter) → Node parser → `tables.json` → fragment batch (A/B first) → fragment + Spice presentation → change-over-time layer.

## Character-creation pass + Spice-Curve regrade (2026-06-20)

A working block on the spirit-guide (bardo) ritual and the world-skeleton tables:

- **Life-die roll display fixed.** The Layer-2 "Life" (XGE "This Is Your Life") die settled back to its dice notation ("d100") after a roll instead of showing the rolled number — breaking dice-transparency in the one place a player most wants the result. `cgLifeStepRoll` now records each step's natural roll + die size; the Life die settles on the number, like the world die already did.
- **Setting (`T.master`) + Built Of (`T.arch`) regraded to the full 5-band Spice Curve** (Grounded/Textured/Strange/Volatile/Mythic), matching the `smell`/`sound` siblings and the canonical ladder. Both are now d100. Setting widened in *register* (true city, opulent quarter, canal city, lush farmland, festival town, frontier boomtown, spa town, toll-gate city) and extended up into Volatile/Mythic — it previously capped at Strange. Built Of expanded 12→24 materials. `FRAG.master`/`FRAG.arch` kept index-aligned (verified: 39/39, 24/24, full d100 coverage, 0 bad lookups in 4k rolls each). Originals archived to `Archive/genesis-tables_pre-spice_2026-06-20.md`.
- **Built Of blessed as the shared Material oracle.** Generic substance table — other generators (dungeon dressing, item flavor, building/wall/door/idol description) should *point at* `T.arch`, not duplicate it. Bell-curve weighting + regional material-availability considered and **deferred** per Adam — a flat d100 with a fat Grounded band already makes common materials common.
- **Wandering Souls roster.** Rolled-but-not-played PCs bank into `U.souls` (same `genesis-universe-v2` store). Found screen offers "↯ Bank as a Wandering Soul" beside "✦ Open your eyes (play this one)"; the universe shelf renders the roster (release ×). Robin Hartley seeded as the first soul (idempotent via `U.seededRobin`). **Deferred:** wiring the dungeon/urban/wilderness adventurer-surfacing rolls to *draw from* this roster (those generators aren't in the play loop yet — Track B).
- **Race-based name generator.** `CHAR_NAMES` per species + `randomCharName(species)` + a 🎲 "name the soul for me" button on the found screen, mirroring the world-name generator.
- **New-player guidance protocol (DM behavior, locked for now).** At a decision point the AI DM presents **three concrete options + an explicit "or something else"** — to teach open-world freedom while giving the overwhelmed a foothold. Revisit once the creator is fleshed out.

**Deferred / drift to close:** these edits live in the inline `T`/`FRAG` in `genesis.html` (Track A, what plays today). The Engine markdown source + `tables.json` recompile still need the same change for Track B — logged in `NEXT-STEPS.md`.

## Modularization, pass 1 — the index spine (2026-06-20)

Decision: begin breaking the `genesis.html` monolith into modules, **developed over localhost**. Production single-file bundle deferred (~a year out; we're in dev for months).

**Module system = ordered classic `<script>` files sharing global scope, NOT ES modules.** Why: the entire UI runs on inline `onclick="fn()"` handlers, which require their functions to stay global. ES modules scope functions to the module → every onclick breaks until UI events are rebound to `addEventListener` — a real, separate refactor, deferred and logged. Classic scripts keep functions global (`window`) and top-level `const` shared via the global lexical environment (cross-file refs resolve at call-time). Verified in a shared-context runtime test: `engine.core.lookup` reads `T`/`fragAt` from main; main's `cgLookup`/`randomCharName` read `CG`/`CHAR_NAMES` from data modules; `CG_BG["Folk Hero"][2]` resolves across files.

**The index (the prioritized piece):** `manifest.json` is the spine — every module registered with `id`, `path`, `type`, `owns` (symbols it is the single source of truth for), `callTimeDeps`. `build/check-manifest.py` enforces it: path existence, unique ids, **single-definition of every owned symbol** (a symbol defined in two files fails the check), orphan-file detection. Run after any module edit. `manifest.loadOrder` is authoritative and mirrored by the `<script>` tag order in `genesis.html`.

**Extracted this pass (proof of pattern, both directions):** `data/character-genesis.js` (CG, CG_BG, CG_CLASS); `data/names.js` (CHAR_NAMES); `src/engine/core.js` (rollDie, lookup, uid, pick). Monolith archived to `Archive/genesis_pre-modular_2026-06-20.html`. `genesis.html` remains the app entry (UI/render + remaining logic + init) and shrinks as modules are carved.

**Dev:** `python3 -m http.server` in the Genesis dir → `http://localhost:8000/genesis.html`.

## Modularization, pass 2 — the data layer (2026-06-20)

Carved the bulk inline data out of the monolith into three classic-script data modules, same pattern as pass 1 (top-level `const`, shared global scope, loaded before logic):

- `data/world-tables.js` — `T` (world/setting tables) + `FRAG` (the player-facing fragment veil, row-aligned to T).
- `data/starting-state.js` — `SS` (factions/pressures/the uncanny/entry), `SS_CONC` (concretization map), `EB` (opening-bundle fallbacks).
- `data/species-backgrounds.js` — `ABIL`, `ABIL_LABEL`, `CLASSES`, `SPECIES`, `BACKGROUNDS`, `TIP`.

Logic that consumes this data (`abilMod`, `rollTbl`, `ebRoll`, `fragAt`, `concretize`) stayed in `genesis.html` — those are step-3 (logic-by-domain) carves. Monolith shrank 2047→1547 lines. `check-manifest.py` clean (7 modules, 19 owned symbols); headless shared-context test confirms the data↔logic seam (rollTbl rolls real text off SS/T, ebRoll off EB, fragAt returns the FRAG row, abilMod(15)=2). One naming collision resolved: a function-local `const T=CT()` in `fillOracleList` (the compiled-tables registry, unrelated to world-tables `T`) was renamed `CTB` so the manifest can own `T` without a false drift error. The plan's `BG_PKG` was a phantom — no such const existed. Pre-carve backup: `Archive/genesis.html.pre-datacarve-*`.

## Modularization, pass 3 — the engine (2026-06-20)

First logic-by-domain pass. Three `src/engine/` modules (classic scripts, loaded after `engine.core`, before the app):

- `src/engine/tables.js` — table-roll primitives: `rollTbl` (flat dN + bell NdM + mod), `fragAt` (the FRAG veil lookup), `ebRoll` (opening-bundle fresh-roll), `concretize` (the uncanny roll-chain).
- `src/engine/world-gen.js` — starting-state roll-chains: `rollFaction`, `rollPressure`, `rollStartingState`, the Entry bridge (`entrySeeds` / `pickTension` / `rollEntry`), and `ssFactionTurn` (the web-tick). These write to the world ledger via the app's `addLedger`/`ledgerOf`/`logEvent` at call-time.
- `src/engine/hexmap.js` — the lazy deterministic hex substrate (SPATIAL-MODEL.md): `HEXW`/`BIOMES`/`COMPASS` + `hashCoord`/`axialRound`/`worldToAxial`/`axialToWorld`/`hexDist`/`terrainAt`/`nodeXY`/`setNodeXY`/`placeTravelNode`.

Deliberately left in the app this pass: **`renderHexMap`** (the SVG paint — a render concern, carve it with `src/world/` render) and **`abilMod`** (a character helper — carve it with `src/creator/`). Also removed a now-dead "Layer 2 data: Xanathar" comment block that had been orphaned above the engine since pass 1 (the CG data it described moved to `data/character-genesis.js`). Monolith shrank 1547→1417 lines. `check-manifest.py` clean (10 modules, 42 owned symbols). Headless shared-context test runs the real chain: `rollStartingState` → 4 factions + 2 pressures + 12 ledger entries, `rollEntry` fills the opening bundle, `ssFactionTurn` ticks, `terrainAt`/`worldToAxial` geometry verified. Pre-carve backup: `Archive/genesis.html.pre-enginecarve-*`.

## Modularization, pass 4 — world state (2026-06-20)

Carved the world-state spine into `src/world/state.js`: persistence (`KEY`/`loadU`/`saveU`/`activeWorld`/`logEvent`), the in-world clock (`clockOf`/`fmtTime`/`timeOfDay`/`fmtClock`/`fmtClockFull`/`advanceClock`), the Curve-of-Revelation gates (`REVEAL_KEYS`/`isRevealed`/`allRevealed`/`reveal`/`showAllPanels`), the World State Ledger (`ledgerOf`/`addLedger`), the node-graph map (`BEARINGS`/`mapOf`/`addNode`/`nodeName`/`findEdge`/`addEdge`/`rollRoute`), and additive legacy-save migration (`migrateWorld`/`migrateAll`).

**Key call:** the live mutable lifecycle globals `let U=loadU()` (the universe) and `let SEED` stayed app-owned in `genesis.html` — only the functions and stable consts moved. The module reads/writes `U` at call-time via shared global scope (same proven pattern as the engine carve; `U`'s `let` binding is instantiated when the monolith runs, after the module is parsed, and every consumer is a UI-triggered function that fires later). `renderWorld` & friends stayed in the app for the render carve. Monolith 1417→1342 lines. `check-manifest.py` clean (11 modules, 71 owned symbols). Headless test (stubbed `localStorage`/`toast`/`renderWorld`) verifies: clock advance (360+600 → Day 1 16:00 afternoon), `migrateWorld` seeds `currentNodeId` from the Setting, write-once edges (two `addEdge` → one edge), ledger append, `slug`, and `saveU` persistence. Pre-carve backup: `Archive/genesis.html.pre-worldstatecarve-*`.

## Modularization, pass 5 — compiled engine + UI (2026-06-20)

Carved the Oracle cluster, splitting its two concerns: `src/engine/compiled.js` holds the **Track-B compiled-tables dice engine** (`CT` = the `window.GENESIS_TABLES` reader, `rollExpr` for flat/bell/mixed dice strings, `rollTable` to roll a compiled table by id — kept separate from `engine.tables`, which rolls the *inline-data* tables; the two engines coexist by design until Track B fully supersedes the inline rituals). `src/ui/oracle.js` holds the Oracle tab (`ORC` state, `ORC_SPICE`, `oracleRoll`, `fillOracleResult`, `fillOracleList`, `renderOracle`). `src/ui/chrome.js` holds `showTab` (panel switch + per-tab render dispatch) and `toast` (+ its `toastTimer`) — note `toast` is what `world.state`'s `reveal()` calls, so it's now a cross-module call-time dep. The app-init tail (`migrateAll()` → `renderWorld()` → `showTab('start')`) stays in `genesis.html`. Monolith 1342→1279 lines. `check-manifest.py` clean (14 modules, 83 owned symbols). Compiled engine verified headless (d6 in-range, `d12+d8` floors at 2, unknown id → null, row fields resolve); the Oracle/chrome DOM render is browser-verified. Pre-carve backup: `Archive/genesis.html.pre-uicarve-*`.

## Modularization, pass 6 — world render (2026-06-20)

Carved the eight world-facing render functions (`renderWorld`/`renderHexMap`/`renderMap`/`renderLedger`/`renderOpening`/`renderPowers`/`renderStart`/`renderShelf`) into `src/world/render.js`. These are *scattered* through the monolith (interleaved with `enterWorld`/`explore`/`beginSession`/etc., which stayed), so they were **AST-extracted by exact character offsets with acorn** rather than line-range cuts, then re-inserted in file order. The creator renders (`renderBardo`, `renderCharge`) deliberately stayed with the creator domain. Monolith 1092 lines. `check-manifest.py` clean (15 modules, 91 owned symbols).

**Verification upgrade (this pass):** stood up a **jsdom harness** that loads the real `genesis.html` with all 15 modules executing in manifest order — a true browser-like run, not node `vm`. Results: the page loads and the init tail runs; `showTab` drives through every tab (start/universe/world/oracle/bardo/charge/genesis) without throwing; and a world rolled inside the jsdom window (`rollStartingState` → 2 factions + 2 pressures + 6 ledger entries, `renderHexMap` → valid `<svg>`, `addEdge` write-once) **proves cross-module `const` sharing (T, SS) holds in a real DOM**. Final rigor: all 8 render functions confirmed **byte-identical** between the pre-carve backup and `render.js` (acorn diff) — the carve is provably pure. (jsdom flags a `localStorage` opaque-origin error and `const`s aren't on `window` — both expected artifacts, not bugs.) Pre-carve backup: `Archive/genesis.html.pre-rendercarve-*`.

## Canon Wandering Souls — shipped vs. local (decided 2026-06-20)

**Decision (Adam):** the characters Adam makes are **canon to the game** — they ship as source data, not as one-off localStorage entries. End-users' own banked souls live only in their browser; the live roster (`U.souls`) is the **union of canon + local**.

**Implementation:** `data/souls-canon.js` exports `CANON_SOULS` — an array of seed-shaped soul records (the shape the in-app banker `soulFromCGEN` produces, plus a stable `id` and `canon:true`). `world.state.seedCanonSouls()` runs inside `migrateAll` on every load and **idempotently** adds any canon soul missing from `U.souls` — matched by stable `id`, and skipping a legacy same-named seed so the old random-uid Robin never duplicates. This **retires the one-off `ROBIN_SEED`** (Robin migrated into `CANON_SOULS`; the `U.seededRobin` flag is no longer used). Adding a character = bank it in-app to read its shape, then transcribe a record with a `canon-<name>` id. First canon entries: Robin Hartley (the demo) + **Brunn Graniteback** (banked from the Ironvale session — captured here because the in-app "Bank as a Wandering Soul" button only exists at the bardo `found` beat, so an already-in-play PC can't be banked through the UI).

Verified headless: fresh roster → {Robin, Brunn}; legacy-Robin roster → no Robin dup + Brunn added; user-banked (Brash) roster → Brash kept + both seeded; re-running is idempotent.

**Open follow-ups:** (1) **"Retire character" action** — an in-play analog of `bankSoul()` so a character past the spirit guide can still be sent to the roster (today banking is `found`-beat only). (2) Canon souls are re-seeded on load, so an end-user removing one via `removeSoul` would see it return next load — fine for now; a "dismissed canon" set is the future fix. (3) `soulsHTML` shows the × remove button on canon souls too; may want to lock canon entries in the shipped build.

## Modularization, pass 7 — the creator (2026-06-20) — Step 3 COMPLETE

Carved the largest domain, the character-genesis + spirit-guide layer, into **five** `src/creator/` modules along clean seams (70 functions, AST-extracted by name with acorn):

- `scores.js` (11) — ability scores: `abilMod`, `roll4d6drop`, `cgRollScores`/`cgAssign`/`cgFinalScores`, swap/drag, `cgDerived`.
- `life.js` (15) — the Life chain: lookups, person-desc, origins/path/events beats, `cgHeadline`, `seedFromLife`.
- `sheet.js` (5) — the manual charge-sheet UI: `cgBind`/`cgCancel`/`cgChips`/`cgPick` + `renderCharge`.
- `bardo.js` (32) — the spirit-guide state machine + beat helpers + dice FX + name rolls + `renderBardo`.
- `roster.js` (7) — Wandering Souls (`rosterSouls`/`soulFromCGEN`/`bankSoul`/`removeSoul`/`soulsHTML`) + name generators.

**Functions only — every top-level `const`/`let` stayed app-owned.** This was deliberate: `WORLDBEATS = STAGES` (and friends) read other globals *at load time*, so moving them to a module loaded before the monolith would TDZ-fault. Keeping `CGEN`/`BARDO`/`CG_DRAG` (mutable) and `STAGES`/`WORLDBEATS`/`GUIDE`/`LIFE_STEP`/`FATE_*` (data) in `genesis.html` — referenced by the carved functions at call-time — sidesteps that entirely (same pattern as `U`/`SEED`). Monolith **2047 → 668 lines (~67% carved)**. `check-manifest.py` clean (**21 modules, 163 owned symbols**). jsdom verified: all six tabs render, and the live bardo flow (choose species/class/background → roll+assign scores → `cgDerived`) runs across modules in a real DOM with no errors. Pre-carve backup: `Archive/genesis.html.pre-creatorcarve-*`.

## GS state container + layer-direction check (2026-06-20)

Two scaling guardrails from the audit (`SCALING.md`):

**`GS` — one mutable-state container** (`src/state.js`, loaded first). All transient globals — `CGEN`, `BARDO`, `CG_DRAG`, `FATE_CTX`, `SEED`, `ORC` — now live as `GS.<x>`; the bare `let` declarations are gone. ~270 references rewritten via AST (acorn/acorn-walk: a reference pass for reads/member-access/template `${}`, a second pass for assignment *targets* which acorn-walk visits as patterns, plus two inline-handler attribute strings the AST can't see). `GS` is `var` (not `const`) **on purpose** — top-level `const`/`let` don't land on `window`, but inline `on*` handlers resolve names against `window`, and a few handlers reference state directly (e.g. `oninput="GS.CGEN.name=this.value"`). Verified in jsdom: all tabs render, the bardo creator flow writes through `GS` across modules, and a dispatched `input` event fires the inline handler and updates `GS.CGEN.name`. `U` stays out of `GS` — it already has its accessor layer in `world.state`. This is organizational (greppable, one home), not enforcing; enforcement comes with the ES-module move. **New mutable state goes in `GS`.**

**Layer-direction check** in `check-manifest.py` (warn-mode): each module has a layer (data 0 < foundation 1 < generators/render 2 < creator-UI 3 < chrome 4 < app 5); a call into a *higher* layer warns, and an unassigned module warns. Current known inversions (6): `world.state → renderWorld`/`toast`, `creator.scores → renderCharge`, creator `sheet`/`roster → showTab`/`toast`. Flip to hard-error once cleaned. (It already earned its keep — it caught a stale `ORC` ownership left over from the GS migration.)

## Modularization, pass 8 — app core (2026-06-20) — DE-MONOLITHING COMPLETE

Carved the last 22 functions out of `genesis.html` into three `src/world/` modules (AST-extracted):
- `play.js` (14) — world-flow: the world-genesis ritual (`startGenesis`/`rollStage`/`rollTriad`/`bindWorld`), the session + exploration loop (`beginSession`/`explore`/`passTime`/`enterWorld`), spawn (`rollCharacter`), destroy.
- `fate.js` (5) — the death/fate system (`killCharacter`/`openFate`/`rollFate`/`finishFate`/`closeFate`).
- `handoff.js` (3) — DM export (`charHandoff`/`handToDM`/`fallbackCopy`).

**`genesis.html` is now a 449-line shell: HTML/CSS + the app-init tail + six top-level consts/lets** (`STAGES`, `WORLDBEATS`, `GUIDE`, `LIFE_STEP`, `FATE_THRESHOLD`, `let U`) and **zero function declarations**. `check-manifest` clean — **25 modules, 185 owned symbols**. jsdom verified: boots clean, all tabs render, and `newWorld → startGenesis` (world-genesis ritual) runs across the new modules. Also swept the now-stale `src/creator/*` header comments (state is in `GS`, not app-owned). Pre-carve backup: `Archive/genesis.html.pre-appcorecarve-*`.

**Full arc:** monolith 2047 → 449 lines (~78% carved), 1 → 25 modules, across passes 1–8.

## Dice visual engine + the "Best for" fix (2026-06-21)

**`src/ui/dice.js` — one dice engine.** The tumble-then-settle animation + the spice "juice" were duplicated four ways (`animateDie` ritual, `bardoDieFx`/`bardoFx` creation, an inline loop in `rollFate`) with three die styles. Consolidated into `dieRoll(el, {result, faces, band, ticks, interval, done, onDone})` + `diceSpice(band, anchor)`; the four context adapters now delegate to it (the old `spicePop` is gone, folded into `diceSpice`). The roll *logic* was already modular (engine layer); now the *visuals* are too — improve dice once, applies everywhere. First improvement shipped: **tumble decay** (flips decelerate into rest via an ease-out delay) + a **settle-pop** (`.settle` class → `@keyframes dieSettle` bounce). Verified in jsdom across all three contexts. `ui.dice` is layer 1 (generic, DOM-only — every layer calls down into it).

**"Best for class" no-op — fixed.** `cgRollScores` auto-applies best-for-class on every roll, so the lone "↺ Best for class" button re-applied the identical result and looked dead from a cold roll. Replaced with an explicit **Best-for-class / As-rolled toggle** (active mode highlighted, mirroring the bardo); added `cgScoreMode` + `cgAssignRolled` to `creator.scores`, and `cgSwap` now marks mode `custom`. The allocation math was always correct (verified: Rogue → DEX gets the highest roll) — the bug was purely that the button had nothing to do on an already-best sheet. (`cgResetScores` is now dead — harmless, sweep later.)

## Pronouns + a real seeding bug caught (2026-06-21)

**Pronoun picker.** A text adventure needs to know how to refer to the PC, so creation now has a pronoun choice. `data/pronouns.js` holds `PRONOUN_SETS` (they/she/he, each with subj/obj/poss/reflex) + `pronounSet(id)`. The picker (`cgPronounPicker`/`cgSetPronouns` in `creator.sheet`) appears in both the bardo `found` beat and the Sheet's bind row; it toggles the active button **via the DOM (no re-render)** so it never clobbers an unsaved name/world input. The choice defaults to `they`, is stored on `GS.CGEN.pronouns`, flows to the banked soul (`soulFromCGEN`) and the in-play character (`cgBind`), and is surfaced to the AI DM in `charHandoff` (`I am playing <name> (they / them) — …`). Canon souls carry it too (Robin/Brunn/Milo = he).

**Bug caught: `data/souls-canon.js` had no `<script>` tag.** It was in the manifest `loadOrder` but was never added to `genesis.html`, so in a real browser `CANON_SOULS` was undefined and `seedCanonSouls` silently no-op'd — **the canon souls (incl. Brunn) never actually seeded.** Headless tests missed it because they loaded the file directly. Fixed (tag added; Milo added as the third canon soul). To stop this class of drift, **`check-manifest.py` now verifies the HTML `<script>` tags against the manifest `loadOrder`** — a missing tag is a hard error, an untracked tag is a warning (with `tables.js` allowlisted as the compiled artifact).

## What's left (polish + the future, per SCALING.md)

The remaining `genesis.html` consts are a natural shell, but if desired: move `STAGES` to a data module (then `WORLDBEATS`/`GUIDE`/`LIFE_STEP` can follow — `WORLDBEATS = STAGES` is the load-order constraint), and `FATE_THRESHOLD` into `fate.js`. Clean the 6 layer-inversion warnings (`world.state → renderWorld`/`toast`, etc.) then flip the layer-check to hard-error. The ES-module migration + the 59 inline-handler rebind ride in with the eventual graphics engine — not before.
