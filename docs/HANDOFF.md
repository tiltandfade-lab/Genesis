---
type: session-handoff
project: Genesis
updated: 2026-06-21
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## Orientation (the 30-second version)
**Genesis is a standalone single-player TTRPG video game** — the player rolls a world into being, an **AI DM narrates**, and worlds persist forever in the browser. Built *on* the Arcana Engine but is **its own product**.

**Where to operate:** everything Genesis lives in **`Obsidian Files/Genesis/`** — `genesis.html` (the game), `Engine/` (clean Genesis-owned Arcana Engine), `Asset Library/` (monsters + NPCs + factions + generators, Genesis-owned), and `Reference/` (the source PDFs + book indexes). **All design docs/specs now live in `docs/`** (reorg 2026-06-21) — see `docs/README.md` for the index; only the root `README.md` + `table-registry.md` stay at the repo root.
**What to ignore:** the `Shifting Vale/` and `Playtest Sandbox/` Arcana Engine copies — the human-DM system. Don't scan/edit them for Genesis work.

## ▶ Running Genesis (CHANGED 2026-06-20 — now modular, needs a server)
`genesis.html` is **no longer a single self-contained file** — it loads `data/*.js` + `src/*.js` modules, which `file://` cannot fetch. **Double-clicking `genesis.html` now shows a broken/empty page.** Run it over localhost:
- **Easiest:** double-click **`~/Desktop/Launchers/Open Genesis.command`** — starts the server (detached) + opens Chrome. Port **5175** (chosen to avoid 5173 Proposal Builder / 5174 Palette Buddy / 8000 Drawing Trainer).
- **Manual:** `cd "Obsidian Files/Genesis" && python3 -m http.server 5175 --bind 127.0.0.1` → open `http://127.0.0.1:5175/genesis.html`.
- Pre-modular single-file copy archived at `Archive/genesis_pre-modular_2026-06-20.html` if the old double-click behavior is ever needed.

## Architecture (modular — DE-MONOLITHING COMPLETE 2026-06-20/21 — read before editing code)
Genesis was de-monolithed from the one big `genesis.html`. **Module system = ordered classic `<script>` files that share global scope — NOT ES modules.** Why: the UI runs on inline `onclick="fn()"`, which needs functions global; ES modules would break every handler until events are rebound to `addEventListener` (deferred — rides in with the eventual graphics engine; see `SCALING.md`).
- **State: monolith 2047 → 449-line shell (HTML/CSS + init + a few consts), 1 → 29 modules** (27 from the de-monolith + 2 creator-data modules added 2026-06-21). All logic lives in `data/*`, `src/state.js`, `src/engine/*`, `src/world/*`, `src/ui/*`, `src/creator/*`.
- **`manifest.json` is the index/spine:** every module's `id` / `path` / `owns` (single-source-of-truth symbols) / `callTimeDeps` / `layer`. **Run `python3 build/check-manifest.py` after any module edit** — it fails on missing paths, duplicate ids, drift (a symbol defined twice), a manifest `loadOrder` entry **with no `<script>` tag in genesis.html** (added 2026-06-21 after that exact bug bit), and warns on layer-direction inversions + orphan files. `manifest.loadOrder` = the `<script>` tag order.
- **All transient mutable state lives in one container: `GS`** (`src/state.js`, `var GS` so inline handlers can reach it) — `GS.CGEN`/`GS.BARDO`/`GS.SEED`/`GS.CG_DRAG`/`GS.FATE_CTX`/`GS.ORC`. The persistent universe `U` keeps its own accessor layer in `world.state`. **New mutable state goes in `GS`.**
- **Verification tooling:** acorn (AST extraction/rename) + jsdom (run the real `genesis.html` headless, drive tabs/flows) — `npm i --no-save` in a scratch dir; reinstall per shell call.
- See `SCALING.md` (the architecture audit + the "when to migrate" answer) and memory `project_genesis_modularization`.

## ▶ Version control (NEW 2026-06-21 — read if you're in Claude Code)
The repo is now under **git** (local; no remote yet). The root **`CLAUDE.md`** is the operating contract — read it first; it has the run command, the architecture, the command table, and the disciplines.
- **Commit in logical units** with a clear message; the working tree was clean at handoff (`d7f4f76`).
- **Before considering a change done:** run `python3 build/check-manifest.py` (after module edits) and a jsdom headless pass (load the real `genesis.html`, drive the flow). Recompile tables with `python3 "Engine/00. _System/compile-tables.py" --emit` if you touched Engine table markdown.
- **Tracked vs not:** source + docs + `tables.json`/`tables.js` + `Reference/SRD-Data/` are committed. **Ignored:** the scanned rulebook PDFs (large + copyrighted — never push), `Archive/`, `node_modules`, `.DS_Store`. `tables.json`/`tables.js` are committed *but generated* — never hand-edit; recompile.
- **No remote yet** — when Adam has a token, `git remote add origin <url>` + `git push -u origin main` (keep it private).

## This session (2026-06-21 — latest) — Git repo + `CLAUDE.md` (Claude Code readiness)
- **`git init` + first commits** (`6428d47` initial, `d7f4f76` track table artifacts). `.gitignore` excludes the copyrighted PDFs (~705M), `Archive/`, `node_modules`, `.DS_Store`; everything else tracked. Working tree clean.
- **Root `CLAUDE.md`** authored — the cross-surface contract Claude Code + the Cowork `genesis` skill both read.
- **Reversed the table-artifact ignore** — `tables.json`/`tables.js` are now tracked so a fresh checkout always runs (Oracle needs `tables.js`) and compile output is diff-able. Still generated.
- Memory: `project_genesis_git`.

## This session (2026-06-21 — docs) — Docs reorg + the combat/XP/advancement spec family
- **All design docs moved to `docs/`.** Root now holds only `README.md` + `table-registry.md`. References fixed in `README.md` and the comment/`desc` pointers across `genesis.html` / `src/world/state.js` / `src/state.js` / `src/engine/hexmap.js` / `build/check-manifest.py` / `manifest.json` (`X.md` → `docs/X.md`). No `[](file.md)` links existed, so sibling cross-refs stayed valid. `check-manifest` OK, manifest valid JSON. New `docs/README.md` index + `type:` taxonomy.
- **⚠ Adam's to-do (read-only here):** the **`genesis` skill** lists several docs by bare name in its "Source-of-truth docs" section — update them to the `docs/` path via **Settings → Capabilities**. Specifically: `HANDOFF.md`→`docs/HANDOFF.md`, `DESIGN.md`→`docs/DESIGN.md`, `NEXT-STEPS.md`→`docs/NEXT-STEPS.md`, `SPICE-CURVE.md`/`GAP-ANALYSIS.md`/`GENERICIZATION-SCAN.md`/`LOOT-REMAP.md` → `docs/…` (the `Reference/SRD-Data/README.md` line is a *different* README and does **not** change). Project instructions don't name doc filepaths, so they're fine.
- **Specced the engine's meat & potatoes (4 new `system-spec` docs):** `EVENT-CONTRACT.md` (the DM↔script typed-event interface; **detected > declared**; adjudication-as-precedent — the spine), `ADVANCEMENT.md` (ledger-spine XP, combat as a gated modifier, threshold leveling on a rest, creativity off the XP axis), `DIFFICULTY.md` (fixed-by-default power bands + narrative-exception scaling, mandatory threat-signaling, murder-hobo answered by named responses via faction clocks), `COMBAT.md` (theater-of-mind zone-band 5.5 engine, cover from terrain specs — sketch; engine deferred to Fable, event surface specced now). Five decision rows added to `DESIGN.md`.
- **Key design locks this session:** XP = resolved tension (one ledger economy, not two pools); combat XP gated to objectives; leveling by XP thresholds applied on a (short) rest; world is fixed-by-default with narrative-exception scaling + danger-telegraphing; murder-hobo is answered, not prevented.

## This session (2026-06-21 — later) — Guided creator COMPLETE: skills / equipment / spells / feat + multi-die
- **The bardo now walks every pick it used to auto-generate.** After scores, four new beats — **Skills → Kit → Spells → Feat** — each with a 🎲 "choose for me" shortcut (three-options ethos).
  - **Skills:** class skill choices (n-from-list), excluding any the background already grants (no-duplicate rule).
  - **Equipment:** starting-equipment A/B (Fighter C / all-gold) packages → `inventory` + `gold`.
  - **Spells (casters only):** cantrips + L1 by class counts, filtered from `SPELLS_SLIM`; non-casters pass gracefully; Paladin/Ranger (0 cantrips) handled.
  - **Feat:** the background's **origin feat** — Magic Initiate resolves 2 cantrips + 1 L1 spell (right ability); Skilled resolves 3 skills (excl. bg/class dupes); Alert/Savage Attacker confirm. `ORIGIN_FEATS` data. (No ASI at L1 — that's a level-4 general feat.)
- **Multi-die roll display** — `roll4d6breakdown()` keeps the four d6 + the dropped one; the bardo slots and the manual Sheet "YOUR ROLLS" strip render them (`miniDice()` + `.score-dice` CSS). Closes the named UX-backlog miss.
- **Data shipped as `<script>` globals, not fetched** — `data/srd-creator.js` (curated `CLASS_SKILLS`/`CLASS_KIT`/`CLASS_CASTING`/`ALL_SKILLS`/`ORIGIN_FEATS`) + `data/spells-slim.js` (generated by `build/gen-spells-slim.py` from `spells.json`; 84 spells, ~17 KB). Resolves the "inline vs localhost JSON" fork: `file://` can't `fetch()`, so `<script src>` it is (the `tables.js` constraint).
- **Picks land on the sheet** via shared `cgSheetExtras()` (used by `cgBind` + `soulFromCGEN`): `skillProfs` merges bg+class+feat; `classSkills`/`inventory`/`gold`/`kit`/`cantrips`/`spells`/`spellAbility` + `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility` added. Manual Sheet punt line updated to point at the guided creator.
- **Verified:** 62/62 headless jsdom (real `genesis.html`, all scripts in document order — class auto-fill, feat cases incl. Magic Initiate + Skilled + no-choice, the 4d6 breakdown, all four render branches, Bard choose-any-3). `check-manifest` OK — **29 modules, 214 owned symbols**.
- **Character Creator focus (opened 2026-06-20) is now COMPLETE.**

## This session (2026-06-21 — earlier)
- **De-monolithing finished (passes 2–8).** Carved the data layer, the engine (`tables`/`world-gen`/`hexmap`/`compiled`), `world.state` + `world.render`, the UI (`oracle`/`chrome`/`dice`), the whole creator (`scores`/`life`/`sheet`/`bardo`/`roster`), and the app core (`world.play`/`fate`/`handoff`). `genesis.html` is now a 449-line shell; 27 modules; `check-manifest` clean. AST (acorn) for scattered carves, jsdom to verify each.
- **Scaling audit → `SCALING.md`.** Verdict: classic-script model scales fine for now; the real risk was global mutable state (now in `GS`); ES-modules migration should ride in **with the eventual graphics engine**, not before (the 59 inline handlers are the blocker). Render/state separation is already graphics-ready.
- **Two scaling guardrails:** the **`GS` state container** (~270 refs migrated), and a **layer-direction check** in `check-manifest` (warn-mode; flips to error once the 6 known inversions are cleaned). Plus the **HTML-tag check** (below).
- **Canon Wandering Souls** are now shipped source (`data/souls-canon.js` → `CANON_SOULS`, idempotently seeded by `world.state.seedCanonSouls`): **Robin, Brunn, Milo**. End-users' banked souls stay local; roster = union. (Replaced the one-off `ROBIN_SEED`.)
- **Pronoun picker** in creation (`data/pronouns.js`; they/she/he) → flows to the soul, the in-play character, and the **DM handoff** (`I am playing X (he / him) — …`). Default they/them.
- **Dice engine consolidated** → `src/ui/dice.js` (`dieRoll` + `diceSpice`); all four contexts (ritual/creation/fate) delegate to it. Shipped a first improvement: tumble-decay + settle-pop. Improve dice **here**.
- **Bugs fixed:** the Sheet's "Best for class" no-op (now a Best/As-rolled toggle); and a real one — `data/souls-canon.js` was in the manifest but had **no `<script>` tag**, so canon souls never actually seeded in-browser. Fixed + the new tag-check prevents recurrence.
- New/updated memory: `project_genesis_canon_souls`, `project_genesis_modularization`.

## Prior session (2026-06-20)
- **Fixed** the Layer-2 "Life" die — now shows the rolled number (was snapping back to the "d100" notation, breaking dice-transparency).
- **Setting (`T.master`) + Built Of (`T.arch`) regraded to the full 5-band Spice Curve**, both now d100. Setting widened in *register* (true city, opulent quarter, canal, lush farmland, festival town, frontier, spa, toll-gate) and extended into Volatile/Mythic (was capped at Strange). Built Of expanded 12→24 and blessed as the shared **Material oracle**. `FRAG.master`/`FRAG.arch` re-aligned (verified). Originals: `Archive/genesis-tables_pre-spice_2026-06-20.md`.
- **Wandering Souls roster** — rolled-but-not-played PCs bank into `U.souls` ("↯ Bank as a Wandering Soul" on the found screen; rendered on the universe shelf). **Robin Hartley** seeded as the first soul (portable record also at `Asset Library/Player Characters/Robin Hartley.md`). Default: bank rolled PCs unless Adam says "play this one out" (`feedback_genesis_bank_pcs`).
- **Race-based name generator** (🎲 "name the soul for me" on the found screen, per species).
- **Modularization pass 1** + manifest/consistency-check spine + the `Open Genesis.command` launcher (above).
- **DM new-player protocol:** at decision points present three concrete options + an explicit "or something else" (`feedback_dm_three_options`).
- New memories: `project_genesis_modularization`, `project_genesis_creator_focus`, `feedback_genesis_bank_pcs`, `feedback_dm_three_options`.
- **Deferred / owed (tracked in `NEXT-STEPS.md`):** continue the modular migration (data layer next: `world-tables.js` = T+FRAG); **Track B sync** — mirror the Setting/Built Of regrade into the Engine markdown source + recompile `tables.json`; wire the dungeon/urban/wilderness adventurer-surfacing rolls to draw from the Wandering Souls roster; then the **creator walkthrough** (class skills / A-B equipment / spells, via SRD-as-JSON over localhost).

## Read these (source of truth — don't re-derive)
- **`DESIGN.md`** — every locked decision. Read before proposing any design change. *(Now carries the **anti-drift north star**: the deterministic state layer is authoritative, the AI is only the interpreter — maximize what the script serves; see also `project_genesis_thesis` memory.)*
- **`SPATIAL-MODEL.md`** — geography (2026-06-19): node-graph **cognition** + lazy deterministic **hex substrate** (unbounded fraying plane, AI never holds the grid); travel = scene-to-scene **wilderness-encounter series**, not a hex-crawl.
- **`NEW-GAME-FLOW.md`** — ⭐ the live spec for the guided creation (the Bardo: soul→sheet→life→world, one choice/roll at a time) + §8 Curve of Revelation + §9 the chat-first interface. **Read this first for any UI / creation work — it's the most active design surface.**
- **`CHANGELOG.md`** — ⭐ running changelog, newest first (started 2026-06-21). **Add a dated entry every working session** (Added / Changed / Fixed / Deferred).
- **`SCALING.md`** — ⭐ the architecture/scaling audit (2026-06-21): the classic-script vs ES-modules call, the `GS` state discipline, the layer-check, and *when* to migrate (with the graphics engine). Read before any structural change or before adding a rendering/graphics layer.
- **`NEXT-STEPS.md`** — the ordered build plan; "Do next" at the bottom.
- **`SPICE-CURVE.md`** — the intensity-grading spec.
- **`GAP-ANALYSIS.md`** — what's missing and why.
- **`GENERICIZATION-SCAN.md`** — the IP/campaign scrub record (detection + SRD cross-check + what was wiped).
- **`Reference/_Index/`** — creature/section → page indexes for the 2024 MM, PHB, DMG.
- **`Reference/SRD-Data/`** — machine-readable SRD 5.2.1 (everything except monsters): `spells.json` (339), `conditions.json` (15) + `rules-glossary.json` (155), `magic-items.json` (258), `equipment-weapons-armor.json`, `classes-species-backgrounds-feats.json`, + faithful markdown for core rules / classes / origins / equipment. See its `README.md`. **This is the AI DM's rules-lookup layer.**
- **`LOOT-REMAP.md`** — the loot-system overhaul spec (D&D rarity axis + 4 tiers of play).
- Memory: `project_genesis`, `project_srd_data`, `project_dnd_books_reference`, `project_genesis_genericization`, `feedback_default_genesis_context`, `feedback_monster_custom_tables`, `feedback_read_vault_before_claims`, `feedback_dm_agency`, `feedback_vault_workflow`.
- **Skill:** the `genesis` skill is now installed — it auto-loads this context. (It hands Shifting-Vale / playtest triggers back to `arcana-playtest`.)

## What Genesis is (the locked shape — unchanged)
- **Loop:** roll a world skeleton → enter → explore (rolls new corners) / ask about the past (lazy history) → AI DM weaves it → everything persists. World = save file; worlds accumulate into a universe; only explicit destroy unmakes one.
- **AI DM narrates** (definitive). Player rolls openly (dice transparency, not a silent DM).
- **Fragment oracle (default):** player sees a 6–10 word sensory fragment; DM sees the real row, reveals via narration.
- **Spice = emergent.** 5-band ladder (Grounded→Textured→Strange→Volatile→Mythic) as honest per-table rarity; spicy roll → spicy outcome → written to the ledger. No time-escalation, **no tonal railroad**.
- **Time:** visible in-world clock, advances only via DM-declared transitions (travel/rest/montage). Two counters (session + in-world).
- **World State Ledger** = single home for ALL change-over-time info.
- **Map:** primitive node-graph (places=nodes, routes=weighted edges); spatial facts write-once canon.
- **Combat parked for Fable.** Stock 5.5e, bend reactively + log it.

## Current build state of `genesis.html` (as of 2026-06-19, end of the big session)
**The game now opens as a guided experience — read `NEW-GAME-FLOW.md` first for the creation/interface design; it's the live spec.**
- **Start screen:** app lands on a simple immersive `panel-start` (`renderStart`) — "GENESIS" + one line + **✦ Begin** → the guided creation; a quiet "↩ return to your worlds (N)" appears only if worlds exist. (Init = `showTab('start')`.)
- **THE BARDO — the guided New Game (spirit-guide, one choice/roll at a time).** A single `buildBardoSeq()` walks: **threshold → soul (wordless intro) → species → class → background** (guided choices with `TIP` tooltips) **→ scores** (4d6-drop-lowest, one ability at a time, then "Best for class" / "As they fell") **→ life** (ONE roll per sub-table — dynamic queue: parents·birthplace·siblings→birthOrder·family→absentParent·means·home·memory·why-bg·why-class·age→events×N) **→ world** (the 9 skeleton beats, **trouble last**) **→ found** (name the soul + the world, last) **→ "✦ Open your eyes."** `bardoFound` assembles **world then character** (`bindWorld`+`cgBind`). Each die shows its real notation (d100/4d6/d6) + tumble + spice "juice" (Bizarre/Otherworldly/SPICY); 3-reroll shared budget; a running log accretes the soul. Old `#panel-charge` menu bypassed (kept for fate/successor).
- **Curve of Revelation (anti-overwhelm):** first-timers wake into a MINIMAL world view; Powers/Map/Ledger/Gazetteer reveal on first relevance (travel→Map, transition→Ledger, montage→Powers) with a fading-guide line; learned panels persist (`U.revealed`); veterans (3rd world+ / "reveal all") wake fully open. **Diegetic clock:** player sees day + time-of-day band ("Day 2 · morning"); exact minute gated by `w.knowsTime` (timepiece/class hook); DM gets exact.
- **Interface v1 (chat-first, in progress):** top tabs → **left nav rail** (`.rail`: ✦ Universe · ◈ World · ⚅ Oracle); content in `.stagecol`; creation/bardo go immersive (rail hidden). **NOT yet done:** the World view as a chat/scene feed + Disco-Elysium column-slide (the substantive chat-first part — the next build).
- **Compiled tables:** `Engine/00. _System/compile-tables.py` parses the markdown corpus → `tables.json` + **`tables.js`** (a `window.GENESIS_TABLES` global; `file://` can't fetch, but `<script src>` loads). Dice-aware (flat dN, bell NdM, mixed d12+d8). `genesis.html` loads `tables.js`; the **Oracle tab** rolls any of the 328 compiled tables. **But the bardo/world rituals still run on INLINE table data** (`T`/`SS`/`EB`/`CG`/`FRAG`) — migrating the rituals onto the compiled layer is future work.
- **Fragments:** the world-genesis cards + pressures show the player a fragment (the `FRAG` veil, inline); the DM gets the real row via `handToDM`. The *compiled* tables.json fragment-slots are still null (broader Fragment batch = future).
- **World spine (Track A) live:** World State Ledger, visible clock + transitions, node-graph + hex map, localStorage (`genesis-universe-v2`), legacy-save migration.
- **Not built:** chat-centered world view + column-slide; change-over-time layer (faction clocks/drift/NPC life-events — ledger ready, char-genesis seeds it); compiled-table migration of the rituals; tarot; combat (parked for Fable).

## Monster library + reference (built this session)
- **`Asset Library/Monsters & Enemies/` ≈ 379 files / ~536 stat blocks** — effectively the full 2024 Monster Manual + SRD, all 2024-canon. Adam's ~66 originals were audited to 2024; the rest came from the **SRD** (clean programmatic parse) + **MM-vision subagents** for the ~50 non-SRD IP creatures. Dragons consolidated (one file per color, all ages + Adam's custom tables).
- **Adam's custom d10 flavor tables are SACRED** (see `feedback_monster_custom_tables`) — never overwrite; stat-fixes touch mechanics only.
- **`Reference/`** holds the scanned MM/DMG/PHB 2024 (broken OCR — vision-read stat blocks, never parse the text layer). The clean **SRD 5.2.1** lives in Adam's top-level **`Books/2024/`** (real text layer → parseable). Indexes in `Reference/_Index/`.

## What happened this session (2026-06-18)
- **Built Track A** (World State Ledger + clock + node-graph map) into `genesis.html`; verified in a headless harness; legacy-save migration added.
- **Brought the Asset Library into Genesis** (NPCs, Factions, Narrative Devices, generators, design-heritage docs) from Shifting Vale — Genesis-owned copies.
- **Monster library 66 → ~379:** audited stale monsters to 2024, SRD bulk import, MM-vision import of IP holdouts, dragon consolidation. (Fixed a parser-contamination bug — see gotchas.)
- **Built book indexes** (`Reference/_Index/`) and acquired the SRD.
- **Genericization:** detection scan + SRD cross-check + **destructive Phase-2 wipe** (69 files, FR/campaign specifics → generic placeholders; SRD-safe terms + celebrity analogs kept).
- **Indexed the full SRD 5.2.1 into `Reference/SRD-Data/`** (everything except monsters): 339 spells, 155 glossary entries (incl. 15 conditions), 258 magic items, 38 weapons + 13 armor — all as queryable JSON — plus faithful markdown for core rules, classes, character creation, origins/feats, equipment. Hybrid JSON+MD, programmatic parse of the SRD's clean text layer. This is the DM's rules-lookup layer (complements the monster library).
- **Loot system overhaul** (`LOOT-REMAP.md`): remapped onto D&D rarity + the 4 DMG tiers of play. Renamed the whimsical "Legendary" → `Dungeon Loot - Minor Wondrous`; built true `Legendary` (32 SRD) + `Artifact` tables; merged the 258 SRD items into the rarity tables (Common 31 / Uncommon 87 / Rare 101 / Very Rare 64 — 247/258 reachable, Adam's curated rows preserved); reconciled the entry layer (Budget drives rarity, Composition = presentation wrapper, Tier retired); extended Budget to T3/T4; `Treasure Generator` → v1.1. Originals archived. Also fixed a `magic-items.json` attunement-wrap bug (+40 items).
- **Locked the edit-source → compile-artifact architecture** (DESIGN): markdown tables = editable source; compiled JSON = generated build artifact; engine does mechanics, AI does interpretation; compile validates cross-references.
- **Fixed the default-context drift** (Adam noticed new sessions digging through Shifting Vale): added `feedback_default_genesis_context` + reframed memory; built and shipped the `genesis` skill. Adam still needs to update the **project instructions** in the Claude app (they're the root pull — they still name Shifting Vale and not Genesis).

## This session (2026-06-19) — Character Creation, built end-to-end
The `(a)/(b)/(c)` fork (NEXT-STEPS item 14) is **resolved and built.** Adam's call mid-build: use his Xanathar's **"This Is Your Life"** tables (he sent the wikidot transcription) as the biographical layer — which reframed the fork into **two interlocking layers**:
- **The Sheet** (mechanical `(c)` hybrid) — player chooses species/class/background, rolls scores **4d6 drop lowest** openly, engine computes the cheap derived numbers (HP/AC/mods/PB/passive Per/saves), heavy class-feature/gear/spell text stays a **`SRD-Data` pointer** the DM resolves at the table. *(Finding: class mechanics aren't queryable yet — they're prose in `classes.md`, not JSON — which is why pure-`(a)` auto-fill was heavier than it looked.)*
- **The Life** (biography) — the XGE "This Is Your Life" roll-chain (Origins → Personal Decisions → Life Events → Supplemental), **keyed to the chosen class+background**. Player rolls openly; the AI DM guides + weaves.

Both interlock; backstory people/threads **auto-seed the World State Ledger as write-once canon** (char-genesis *seeds the world* — feeds reincorporation / NPC-life-events / lie systems). The fate-d20 successor reuses the same ritual. Retired the flat `SPARK` for a derived headline.

**Shipped:** `CHAR-CREATION.md` (canonical spec), `Engine/03._Tables/04. Character Genesis/This Is Your Life.md` (XGE suite as markdown source) + `Genesis Backgrounds.md` (native backgrounds), `Engine/02._Procedures/Character Genesis Procedure v1.0.md`, the ritual in `genesis.html` (new `#panel-charge`, inline `CLASSES`/`SPECIES`/`BACKGROUNDS`/`CG`/`CG_BG`/`CG_CLASS` data + logic). Verified **34/34** in a headless harness (`outputs/cg_harness.js` — table coverage, derived numbers, score assignment + swap/reset, background integrity, 1500-run life-chain stress, seeding, handoff).

**Also 2026-06-19 (Adam's follow-ups):** (1) **drag / tap-to-reassign ability scores** — defaults to best-by-class, draggable cards, "↺ Best for class" reset, background +2/+1 stays pinned. (2) **Backgrounds → 19** — 4 SRD + 6 Genesis-native (Bog-Iron Digger, Glass-Singer, Hearth-Watch, Crier, River-Rat, Pilgrim) + 9 standard archetypes (Charlatan, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sailor, Urchin) **rebuilt IP-clean** (own packages + own prose, SRD feats only). (3) **Genericized the whole biography suite** — rewrote the XGE "This Is Your Life" chain into original, IP-clean, spice-graded prose as `Life & Origins.md` (+ inline `CG`/`CG_CLASS`/`CG_BG`); scrubbed named planes / fey-fiend-celestial / Underdark / named monsters / Spell Scroll / Potion of Healing / Wish / the "Race" table; dice ranges + branch logic + seeding preserved; XGE archived heritage-only in `04. Character Genesis/zz_Archive/`. Character genesis is now **public-release-clean** (only the 16 PI monsters + placeholder→native-generator work remain in `GENERICIZATION-SCAN.md`). Verified **35/35** (adds a headless IP-scrub guard + 19-background check). Canonical source: `Life & Origins.md` + `Genesis Backgrounds.md`.

**⚠ IP flag (deferred, logged):** "This Is Your Life" is **Xanathar's, not SRD 5.2.1.** Fine for Adam's personal tool; genericize before any public release (same treatment as the PI monsters — see `GENERICIZATION-SCAN.md` + `CHAR-CREATION.md`).

## This session (2026-06-19) — the big build (after char-creation, above)
The session went from "validate the tables" all the way to "the game opens as a guided experience." In order:
1. **Table census + frontmatter:** stamped **lean YAML across all 754 files** (Engine/03._Tables + Asset Library incl. monsters); `id`/`type`/`domain`/`status` + (on tables) `table_class`/`player_facing`/`voice_critical`; die/rows/spice are DERIVED by the compiler, not stored. Enforcer `Engine/00. _System/stamp-frontmatter.py` (idempotent, additive); schema doc `Engine/01. _Templates/_Table Frontmatter Schema.md`. `table_class` reviewed → Commitment tightened 44→11.
2. **Compiler:** `Engine/00. _System/compile-tables.py` — validates coverage (dash-normalize, full-die), **dice-aware** (NdM/d12+d8 declared in heading, confirmed by row range), emits `tables.json` + `tables.js`. First run: 344 dice tables, 0 real coverage bugs. Fixed `region-encounter` missing header.
3. **Wired the game to the compiled tables** via `tables.js` + the **Oracle tab** (roll any of 328).
4. **Entry bridge** (the opening scenario) rebuilt — `rollEntry` assembles the 5-slot bundle; Option C fresh `EB` tables (`Starting State - Opening Bundle.md`, d100 spice-graded).
5. **Fragment veil** on the world-genesis cards + pressures (the `FRAG` map).
6. **Curve of Revelation** (progressive panel reveal + diegetic clock).
7. **THE BARDO**: built the guided New Game, then **reshaped it to `soul → sheet → life → world`**, one choice/roll at a time, no menus; **finer life = one roll per sub-table**; name moved to the end; dice show real notation.
8. **Interface v1**: left nav rail + start screen (fixed a `.stage` class-collision that blanked the screen → renamed to `.stagecol`).
9. **Content**: taboo + smell + sound expanded to d100 spice curves (rare unpleasant + uncanny tails).
Full detail in the `project_genesis` memory and `NEW-GAME-FLOW.md`.

## Next move
**Two live lanes:**

**(A) Build the advancement system (the new spec family — "meat & potatoes").** The specs exist (`EVENT-CONTRACT.md` / `ADVANCEMENT.md` / `DIFFICULTY.md` / `COMBAT.md`); design is locked. The load-bearing first build step is **`CLASS_PROGRESSION` data (levels 2–20)** — parse the SRD `classes.md` Features tables into structured data (the L1 treatment in `data/srd-creator.js`, extended), which unblocks real leveling *and* richer DM lookups. Then: the **event-contract plumbing** (typed events → script-owned XP ledger, detected-from-state-deltas first) and the **XP-threshold + rest-gated level-up beat** (reuse the creator bardo machinery). Combat award-values wait for the engine; everything else is buildable now. Decide the **threshold curve** (SRD vs custom) before wiring. **Good first Claude Code task:** `CLASS_PROGRESSION` is self-contained (a data module + tests, no UI), so it's an ideal way to feel out the Claude Code loop — build it, run check-manifest + a jsdom assert, commit.

**(B) The chat-first interface (the substantive part)** — `NEW-GAME-FLOW.md §9` + build-order. Shell foundation (left rail, start screen, immersive bardo) done; remaining below.

*(Lighter alternatives: "retire character" in-play action; generalize multi-die display to Oracle/world rolls; the Fragment batch.)*

**(B) chat-first interface — remaining:**
1. **World view → chat/scene feed:** make the World view a conversation-centered column — the Chronicle as a DM-conversation feed, a scene header (where you are + the opening tension), and an **action input / Hand-to-DM front and center**. This is "mostly a chat interface."
2. **Disco-Elysium column-slide:** opening a rail menu slides the chat into a right column (two-pane); promote the revealed panels (Sheet, Map, Ledger, Powers) into the **left rail** per the Curve of Revelation, instead of stacked sections.
3. **Text animations** on the DM/scene text (Adam wants "really nice animations for the text").

**Other open threads (not blocking):** richer dice animation (literal 4×d6 / 3D tumble); the broader **Fragment batch** (fill compiled `tables.json` fragment-slots so the Oracle + future surfaces show fragments); migrate the bardo/world rituals onto the **compiled** tables (today inline `T`/`SS`/`EB`/`FRAG`); change-over-time layer (faction clocks/drift/NPC life-events off the live ledger); remaining world tables (arch, etc.) → d100 spice; Wilderness Encounter Generator inline port.

### Backlog (other open moves, not this session)
- **Native generators** — name / faction / deity / culture / place, to replace genericization placeholders. *Where Genesis fully branches off core D&D.*
- **Track B data pipeline** — per-table frontmatter → `tables.json` → wire `genesis.html` off inline data → fragment batch. Unblocks Fragment + Spice.
- **Change-over-time layer** — faction clocks / drift / reincorporation / NPC life-events (hang off the live ledger + clock).
- **Loot follow-ups** — L3b (home the 5 rarity-spanning variants), L4 (band the Outlandish d300 by power + level-gate — the DeLorean fix), L7 (regenerate `table-registry`).
- **Monster reskin** — the ~16 non-SRD Product-Identity creatures (Beholder, Mind Flayer, Slaad, etc.) for public release.

## Gotchas
- `genesis.html` uses INLINE data, not the registry (wiring it = Track B).
- **Scanned MM/DMG/PHB have broken OCR** — vision-read stat blocks (320-DPI crops), never trust the text layer for numbers. The **SRD has a clean text layer** (parse it). When parsing SRD blocks, the type-detector must handle "Medium or Small <Type>", "Swarm of…", and lycanthrope types (detect block-start = any size-line followed by an "AC " line), or creatures get absorbed into neighbors.
- **bash `rm` is blocked in the mount** — use `mcp__cowork__allow_cowork_file_delete` first.
- **Read actual engine files before claiming a gap** — the engine keeps superseded versions; auditing a stale file produces false "missing" reports.
- DM-agency rules apply in play (`feedback_dm_agency`).
- **`genesis` skill now exists** (installed) — handles orientation + hands Vale/playtest triggers to `arcana-playtest`. The **project instructions** (Claude-app settings, not a file) still name Shifting Vale, not Genesis — Adam needs to update them; that's the remaining root pull toward the Vale.
- **Loot tables are remapped** (`LOOT-REMAP.md`) — don't treat the old "Tier" table or whimsical "Legendary" as live; the SRD additions in the rarity tables are pointer-format rows (rows 1–N are Adam's curated picks, verbatim).
- Minor cleanups outstanding: cosmetic heading-number collisions in grouped monster files; genericization placeholders are readable but not final names (generator work); a few all-lowercase small-caps subheadings in the SRD-Data markdown are lightly spaced.
