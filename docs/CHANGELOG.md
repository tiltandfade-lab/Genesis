# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

---

## 2026-06-25 — Project relocated + stale path strings swept

Genesis was moved out of the Obsidian vault to its own home at `~/Desktop/Work/projects/Genesis`
(commits `bf3818c` → `8bb6a93`). It is no longer a sibling of the `Shifting Vale` / `Playtest Sandbox`
human-DM vaults (those now live at `~/Desktop/D&D/Obsidian Files/`). A follow-up pass swept the stale
`Obsidian Files/Genesis/` path strings the move left behind.

### Changed
- **Relocated the repo** to `~/Desktop/Work/projects/Genesis`; recorded the move in `CLAUDE.md`
  (the campaign vaults are "no longer siblings").
- **Swept stale path strings** (`docs/relocation-path-cleanup`, `9f11f6d` → `798d576`): `HANDOFF.md`
  ("Where to operate" + the manual `http.server` run command), `README.md` (docs-folder location),
  `DESIGN.md` (docs-organization decision entry). Verified all referenced paths resolve on disk
  (repo root, campaign vaults, `Open Genesis.command` launcher — the launcher already pointed at the
  new path).
- **Updated the `genesis` skill** to match — live `SKILL.md` **and** the plugin `manifest.json`
  description (the latter is what drives skill triggering), so a fresh session loads the correct
  `~/Desktop/Work/projects/Genesis` paths.

### Left as-is (history, not drift)
- Dated historical log lines in `CHANGELOG.md` (the repo-init entry) and `NEXT-STEPS.md` (the
  2026-06-18 ☑ engine-dedup entry) still name the old path — they record where things were *at that
  date*, so rewriting them would falsify the log.

---

## 2026-06-25 — CODEX Phases 2–5 REVIEWED + MERGED to master

Pre-merge `/code-review` (8 finder angles → 3 real fixes) then `--no-ff` merge of `feat/codex-phase2`
(Phases 2–5) to `master`; pushed to `origin` (`b3eee9a`), branch deleted.

### Fixed (from the review)
- **`startSession` flag ordering** (`play.js`) — set `w.sessionLive=true` BEFORE `beginSession()`, so a
  throw past `beginSession`'s inner catch can't strand a half-started session into a double-increment.
- **Prep-cast id collisions** (`prep.js`) — new `prepCastId()` disambiguates same-named cast records; two
  frontiers rolling the same place/NPC name now mint distinct records instead of silently merging via
  `codexAdd` (which would point both frontier nodes at one location and reveal the wrong one on contact).
- **`status` clobber** (`prep.js`) — merge the NPC status object rather than replacing it wholesale, so a
  future `rollNPC` status field survives the `{at:locId}` placement.
- `verify-prep.mjs` +2 (→36): same-named cast records stay distinct.

### Deferred (logged in NEXT-STEPS — design call needed)
- **Soft-pool eviction cap** — every session casts ~6 soft codex records that survive recycle (the §8b
  reusable pool), and `dmDigest` sends the whole codex each turn, so the digest grows unbounded over a long
  campaign. Needs a prune/cap policy (age-out untouched soft records, or digest only near-PC + 1-hop links).

**Codex Phases 1–5 are now on master.** The anti-drift loop is closed: dice deal the cast, the DM connects
rather than invents. Remaining: Phase 6 (Codex UI panel) + the soft-pool cap + a live re-playtest (eyeball
the Phase 4 shelf button/cinematic; run the `codexProvenanceReport` ratio test vs the ~20% Saltrest baseline).

---

## 2026-06-24 (session 11) — CODEX Phase 5 BUILT (the two missing table-sets)

The tables the Saltrest DM had to invent whole — now rolled. Three net-new **d300 Commitment** tables,
spice-graded 198/60/27/12/3, authored via 3 parallel Sonnet agents (one file each, disjoint lanes) and
compiled.

### Added (Engine tables)
- **`building-interior`** (`Engine/.../Place Generation/Building Interior.md`) — connected spaces + a
  notable feature + who/what's inside, for any building the players enter. The "gran's house had nothing
  to roll" fix. Ladder escalates the SPACE (ordinary rooms → hidden room → impossible geometry).
- **`plot-item`** (`Engine/.../Quests & Problems/Plot Item.md`) — a specific significant object + why it
  matters + what it opens/proves/unlocks. Replaces the abstract `quest-macguffin` *categories*.
- **`plot-lock`** (`Engine/.../Quests & Problems/Plot Lock.md`) — the key/lock complement: what's sealed +
  where the key is kept.
- **Mythic rescaled to cosmic** (Adam's review): the old Mythic read as Strange; the top band now rewrites
  a law of the world — a fact unmade, the inside/outside boundary, the death-and-rebirth wheel itself.
- Recompiled → **337 tables, 0 real coverage bugs**.

### Added (rollers)
- **`rollItem(opts)`** + **`rollBuildingInterior(opts)`** in `src/engine/codex-roll.js` — codexAdd-ready
  payloads. Items are **pointers** (§8b): `source:{type:"plot",ref:"plot-item#<row>"}`, optional `lock`
  rolls the `plot-lock` companion. Building interiors mint a `location` record (layout+feature player-side,
  who's-inside DM-side). `dev/verify-codex-roll.mjs` extended → 38.

Verified: codex-roll 38 · codex 39 · session 16 · prep 34 · prep-bundle 47 · dm-events 21 · check-manifest OK (43 modules).
**Phases 1–5 complete. Next: Phase 6 (Codex UI panel) + re-playtest with the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 10) — CODEX Phase 4 BUILT (the session frame)

The explicit Start/End Session frame — by the time the chat appears, the cast exists as records.

### Added
- **`startSession(id)`** in `src/world/play.js` — the front door: enter the world → `beginSession`
  (casts the codex via `startPrep`) → `wakeIntoWorld` prep/loading cinematic → the DM opens the scene
  once the cast is hard data. Idempotent on a live session (`w.sessionLive` guard — won't double-cast).
- **`endSession()`** — clears `w.sessionLive`, writes a closing ledger/log beat, recycles unvisited soft
  prep (`prepRecycleStale`), returns to the world-select shelf. The soft codex cast survives as the
  reusable pool (§8b).
- **UI** — a **▶ Start session** button on every world card (`renderShelf`) and a session-aware Start/End
  control in the in-world actions (`worldActions`); a gold **"session live"** badge on the active card.
  `.wc-start` style.
- **`dev/verify-session.mjs`** (16) — start increments + casts + idempotent; end clears + recycles +
  returns to shelf + soft cast survives; a fresh start after end begins session 2.

### Changed
- The buried in-world "§ New session" button is replaced by the session-aware ▶ Start / ■ End control;
  time transitions split into their own labeled group.

Verified: session 16 · prep 34 · prep-bundle 47 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Browser render sandbox-blocked here — eyeball the shelf button + cinematic at playtest.** **Next:
re-playtest + the mechanical-vs-invented ratio test → Phase 5 (missing table-sets) → Phase 6 (Codex UI).**

---

## 2026-06-24 (session 9) — CODEX Phase 3 BUILT (prep casts the codex)

The casting pass — the structural fix for the Saltrest "DM invented the whole cast" failure.

### Added
- **`pbundleCast`** in `src/engine/prep-bundle.js` — for each frontier, the engine rolls a soft cast:
  1 named **location** (`rollPlace`) + **1–2 NPCs** (`rollNPC`, the first biased `roleHint:"questgiver"`),
  as codexAdd-ready payloads carried on `environment.cast` in the bundle. No-op (cast:null) if the codex
  rollers / compiled tables aren't loaded.
- **`prepCastFrontier`** in `src/world/prep.js` — `startPrep` mints the cast into `w.codex` as
  `provenance:"prep", soft:true`, binds the location to the frontier node (`node.codexId`), and places the
  NPCs at it (`status.at`). `ensureCodex` runs first (migrates factions/gazetteer). The prep-staged ledger
  line now reports the cast count.

### Changed
- **`lockOnContact`** — entering a rumored frontier now also locks its cast **location** soft→hard
  (touch=canon, §8b) and reveals it; the frontier's NPCs stay a reusable soft pool until actually met.
- **`prepBundleSummary`** — carries a compact cast (location name + NPC names/roles/species) so the
  Stage-1 synthesis-harvest sees the cast to **connect**; the full bundle carries the full payloads.

Verified: prep-bundle 47 · prep 34 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Next: Phase 4 — Start/End Session buttons (world-select → prep casts the codex → cinematic → chat),
then re-playtest + the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 8) — CODEX Phase 2 BUILT (the rollers — the engine mints the atoms)

### Added
- **`src/engine/codex-roll.js`** (`engine.codex-roll`) — `rollNPC(opts)` + `rollPlace(opts)`. The engine
  mints the **atoms**: each chains the already-compiled `npc-*` / `place-*` tables (via `rollTable`) into a
  **`codexAdd`-ready payload** — `rolled` (raw dice verbatim), a player-safe `fields` glance-read
  (species/role/demeanor; place desc/trait/calamity), and DM-only `dm` levers (secret/fear/bond/want;
  place hidden truth + history). `rollNPC` also maps the rolled race → a `CHAR_NAMES` species pool for a
  provisional name (the DM name-confirms); `rollPlace` splits the setting cell's `"Name: desc"`. The
  rollers **don't write the world** — prep / the DM emit `codex_add` events; the AI assigns final meaning +
  wires links. `opts.roleHint` is recorded for the AI; `opts.depth` rolls place-history. `rollItem` waits
  on the Phase-5 plot-item tables.
- **`dev/verify-codex-roll.mjs`** (27 checks — payload shape, DM-secret never leaking into player `fields`,
  the race→species mapper, the name/desc split, and the payloads flowing through `codexAdd` + `codex_add`).

Verified: codex-roll 27/27 · codex (Phase 1) 39/39 · dm-events 21/21 · check-manifest OK (43 modules).
**Next: Phase 3 — prep casts the codex (extend `assemblePrepBundle`; synthesis connects a dice-dealt cast).**

---

## 2026-06-24 (session 7b) — CODEX Phase 1 BUILT (the relational entity store)

Adam approved the spec + refinements (large cast + recontextualization engine, codex-as-store with a
sanitized player projection, touch-locks-to-canon, core link vocab, item pointers). Phase 1 built.

### Added
- **`src/world/codex.js`** (`world.codex`) — the relational entity store. Records `{id, kind, name, rolled
  (verbatim), fields (player-safe), dm (DM-only), links[] (typed wikilinks), status{known,soft,at,
  condition}, source, provenance}`. CRUD, typed links with both-way query (`codexLink`/`codexLinksOf`), the
  **two-tier lifecycle** (`codexReveal`→known; `codexContact`→soft-locks to canon; `codexRecontextualize`
  preserves the rolled soul + reassigns context and **refuses on hard/contacted records**), the soft pool,
  the all-seeing `codexDigest` vs the knowledge-gated **sanitized** `codexPlayerView`, the core link
  vocabulary, and `ensureCodex` migration (gazetteer/factions → records, idempotent, non-destructive).
- **`codex_*` events** in `applyEvent` (`codex_add`/`codex_link`/`codex_update`/`codex_reveal`/
  `codex_contact`). **Digest** now serves the all-seeing `codex` slice.
- **`dev/verify-codex.mjs`** (39 checks).

Verified: codex 39/39 · dm-events 21/21 · wake-prep 47/47 · prep 22/22 · prep-bundle 32/32 ·
check-manifest OK (42 modules). **Next: Phase 2 (`rollNPC`/`rollPlace`) → Phase 3 (prep casts the codex).**

---

## 2026-06-24 (session 7) — Streaming scroll fix + CODEX spec (relational entity layer)

### Fixed
- **Streaming viewport: sticky-bottom, not locked-bottom.** The word-by-word reveal was force-following the
  cursor every token (rigid yank to bottom). Now it only follows if the reader is already at the bottom;
  streaming starts at the new block's top and fills downward at reading pace. `src/world/render.js`.

### Added (spec — no code)
- **`docs/CODEX.md`** — the relational entity layer (NPCs / Locations / Items / Factions as wikilinked
  records in `w.codex`; engine rolls the atoms via `rollNPC`/`rollPlace`, AI assigns meaning + links; prep
  casts the codex; Start/End-Session frame; the missing building-interior + plot-item table gaps). Born from
  the Saltrest playtest, where the DM invented the whole cast because Session-Prep rolls the stage, not the
  players, and there's no entity store. Decision rows in `DESIGN.md` (2026-06-24); `NEXT-STEPS.md` "Do next"
  updated; `README.md` index updated. **Status: spec draft, build pending — Phase 1 (data model) is the
  load-bearing call.**

---

## 2026-06-24 (session 6b) — Skills panel with live modifiers + consumable-resource tracking (slots/HP/pools)

Two features that landed together in the working tree (the resource system via the spawned task), verified
as a union. Branch `feat/skills-and-resources`.

### Added
- **Skill modifiers on the Character panel.** Full 18-skill list, each with its actual roll modifier
  (ability mod + prof if proficient), sorted best-first, ● = proficient — so the player can pick the right
  skill at a glance. New `SKILL_ABILITY` map (`data/srd-creator.js`); render in `renderCharacterPanel`.
- **Consumable-resource tracking (engine-owned).** New `src/engine/resources.js` (`engine.resources`):
  `deriveResources`/`ensureResources` (maxes from `CLASS_PROGRESSION`/`srd-creator`), `spendSlot`,
  `spendResource`, `applyHpDelta` (clamped), `RESOURCE_POOLS`. Sheet now carries current HP (`hpCur`),
  spell slots (`slots`/`slotsMax`, incl. pact), and class pools. A **resource tracker** renders in the
  Character panel (HP, slot pips per level, pools). Smoke-verified: Bard L1 → 2 L1 slots, spend decrements,
  HP clamps at 0.

### Note
- The engine can't know about slots spent **before** it existed — an in-progress save lazy-inits current=max
  on first load, so a mid-session character's counter resets to full once. Authoritative from then on.
- Restore-on-rest wiring + a dedicated resource verify harness are follow-ups (see `feat/resource-tracking` task scope).

Verified: wake-prep 47/47 · dm-events 21/21 · prep 22/22 · check-manifest OK (41 modules) · resource API smoke-test green.

---

## 2026-06-24 (session 6) — Chat: compact scene-head + word-by-word DM streaming + read-from-top scroll + bold + hide topbar

Playtest UX polish on the live chat surface. Branches `feat/chat-stream-compact-header` then `feat/chat-bold-hide-topbar`.

### Added
- **`**bold**` renders in DM narration** (`mdBold`, bold-only, applied over escHtml'd text). Works in the
  static feed and during streaming (re-renders each tick so bold resolves when its closing `**` arrives;
  an unclosed `**` stays literal until closed). XSS-safe — escapes first, then converts.

### Changed
- **Top breadcrumb bar hidden** (`.topbar{display:none}`, `body` padding-top 0) — Adam: useless, reclaim
  the space. `.wrap.ingame` height back to full `100vh`.

Playtest UX polish on the live chat surface. Branch `feat/chat-stream-compact-header`.

### Changed
- **Compact scene-head.** The location header ("Canal-Knot") + its container were eating vertical space —
  trimmed padding/margins and dropped the title 20→15px, clock 16→13px (roughly halved its height).
- **DM replies stream in word-by-word** (LLM-chat style). `applyResponse` sets `GS.dm.animate`; the freshest
  DM line renders as an empty `#dmStream` span carrying the text in `data-full`; `streamDMText()` types it in
  (~24ms/token) with a blinking caret.
- **Scroll lands at the TOP of a new narration, not the bottom.** Streaming scrolls the new message's top
  into view and only follows the cursor when the text runs past the fold — so long narration reads
  top→bottom instead of snapping to the end (the over-correction from session 5). Non-streaming renders
  (your own messages, reloads) still jump to the latest line.

Verified: wake-prep/stream 43/43 · dm-events 21/21 · check-manifest OK.

---

## 2026-06-23 (session 5) — Knowledge-gated panels + panel toggle + viewport-fit layout + font boost + roll-request persistence

### Fixed (roll-request persistence)
- **Roll buttons survived no longer vanish on reload.** The DM's pending `rollRequest` / `ask` lived only
  in transient `GS.dm`, so reloading mid-handshake wiped the roll button (the narration persisted, the
  button didn't). Now `applyResponse` persists them to `w.dm`; `renderWorld` rehydrates `GS.dm` from it on
  load; `sendTurn` clears it when a new turn supersedes. (Playtest-found: Insight button gone after a reload.)

### Fixed (chat ergonomics + reload resilience)
- **Enter sends** the action (Shift+Enter = newline); was Cmd/Ctrl+Enter.
- **Submitting no longer jumps the chat to the top.** The viewport-fit pass had made `.chat-col` the
  scroll container while the scroll-to-bottom still targeted `.dm-feed`; now the **feed** scrolls (head +
  input pinned) and the scroll-to-bottom lands correctly.
- **Reload resumes an in-flight turn.** `sendTurn` persists `w.dm.pendingTurnId`; on load `renderWorld`
  re-attaches `pollResponse`, so a reload mid-wait still receives the DM's reply (cleared on answer / on
  no-answer-timeout). (Playtest-found: reload → permanently stuck on "DM is considering".)
- **Process note:** never run `dev/verify-bridge.py` during a live session — it shares + `/reset`s the
  `.dm/` mailbox and deletes pending turns (memory: project-genesis-bridge-playtest-gotcha).


### Changed (font boost)
- **Type scaled ~30% game-wide** — scripted ×1.3 bump of all 168 `font-size:Npx` declarations across
  `genesis.html` + the render/creator/oracle modules (base body 16.5→21px). Font-size only; spacing,
  icons, and unitless line-heights unchanged. (Chose a scripted px bump over `zoom`, which would have
  fought the viewport-fit's `100vh` math.)


Playtest UX pass from live feedback. Branch `feat/known-gating-and-viewport-fit`.

### Added
- **Knowledge gating (DM-CHARTER slow drip).** The player's **Powers & Pressures** and **Gazetteer**
  panels now show only what the CHARACTER knows. `initKnown(w)` (render.js) idempotently seeds a `known`
  flag per faction / pressure / gazetteer entry — a fresh PC wakes knowing only where they stand and the
  faction they're tied to; everything else is hidden until learned. `explore()` flips discovered entries
  known; the `discovery` event gained `payload.reveal:{factions,pressures}` so the DM surfaces powers as
  the drip reveals them. The DM digest is unchanged — the DM always sees all.

### Changed
- **Panel toggle.** `openPanel(name)` now toggles — clicking an already-open rail item collapses it back
  to the Story view.
- **Viewport-fit layout.** The in-game view (`.wrap.ingame`) is capped at `100vh - topbar`; the chat and
  side panels scroll **internally** — no full-page scroll. (CSS-only; logic-verified headless, pixel-eyeball
  pending at playtest.)

Verified: wake-prep+gating 32/32 · dm-events 21/21 · prep 22/22 · prep-bundle 32/32 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 4) — Waking cinematic: prep/loading screen → DM narration (kill the entry data-dump)

First live playtest over the Bridge surfaced the opening UX as the weak point: waking dropped the
player onto a raw entry-bundle **data dump** (Looming/Enemies/Friends/Complications/Things/Places)
plus a "DM is considering…" spinner, and Session-Prep never fired on a fresh world (it was wired only
to the manual "§ New session" button). Branch `feat/wake-prep-cinematic`.

### Added
- **Prep/loading cinematic** — a full-screen `#wakePrep` overlay (parchment, world-name title, pulsing
  mark + dots; `genesis.html`). `wakeIntoWorld` now raises it over the freshly-rendered world and lifts
  it (`wakeReveal`, cross-fading the chat in) **only when the DM's first words actually arrive** — not on
  a fixed 850ms timer. `GS.wakePrep` gates it; `src/world/play.js` owns `wakeShowPrep`/`wakeReveal`.
- **Auto-prep on first waking** — `wakeIntoWorld` calls `startPrep(w)` (idempotent) so a brand-new
  world's soft frontiers stage automatically; prep no longer depends on remembering the manual button.
- **`dev/verify-wake-prep.mjs`** (16 checks) — globals, overlay toggle gated on `GS.wakePrep`, auto-prep
  staging, and that `renderWorld` no longer emits the data dump.

### Changed
- **The player's opening is the DM's narration, not the data dump.** `renderWorld` no longer renders
  `renderOpening` (the entry bundle still lives in state → feeds `dmDigest`, so the DM weaves it into prose).
  `renderOpening` retained as a no-bridge reference card.
- `applyResponse` / `dmNoAnswer` / `dmBridgeDown` (`src/world/dm.js`) each call `wakeReveal()` so the
  loading screen never strands the player (success, no-DM-after-timeout, or bridge-down all lift it).

### Fixed
- **`dev/verify-dm-events.mjs` was silently broken** — its harness restubbed `STAGES`/`WORLDBEATS`/
  `GUIDE`/`LIFE_STEP`, which became real module consts (`data/creation-flow.js`), throwing a redeclare
  SyntaxError on load. Removed the stub; back to 21/21.

Verified: wake-prep 16/16 · dm-events 21/21 · prep 22/22 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 3) — Session-Prep system, end-to-end (rollers → synthesis → prep state) + crit lens oracle + table audit

**The big one: the AI-DM Session-Prep system is built end-to-end and the game is playtestable over the
Bridge.** Also: the Critical-Magnitude lens oracle, and a full table-usage audit. ~10 `--no-ff` merges.

### Added
- **Crit-Magnitude lens oracle** — two d12 tables `Mythic Success Lenses` / `Mythic Failure Lenses`
  (`Session Mechanics/Consequences/`), each row a *vector* (kind of permanent change), AI fills content
  → fires on *any* d20 action. The magnitude die now also sets a **count** (how many lenses cascade):
  20/11–14:1 · 15–19:2–3 · 20:cascade; failure inverted. Resolves the CRIT-MAGNITUDE §4 "missing middle"
  without reworking the Myth suite. `docs/CRIT-MAGNITUDE.md` §1.1 + curve.
- **Table-usage audit** — `docs/TABLE-USAGE-AUDIT.md` (clickable catalog: every table → source → trigger)
  + `build/gen-table-usage-audit.py` (regenerable). Surfaced **89 of 248 source files Oracle-only** —
  whole unwired systems (Urban Segment walk, NPC depth, Place-Gen d100s, Quest suite) = the Session-Prep
  payload.
- **Session-Prep system** (`docs/SESSION-PREP.md`, `docs/SYNTHESIS-CONTRACT.md`) — the AI DM preps like a
  human DM; *"the story is in the dice"* (over-roll → synthesis pass). Generalizes DM-CHARTER §8.4
  (soft-until-contact) to a recurring heartbeat.
  - **Walk-rollers** (`src/engine/`): `rollUrbanWalk` (`walk.js`, ported from Obsidian Urban Procedure
    v3.1 — 16 topologies), `rollDungeonWalk` (`dungeon-walk.js`, from Dungeon Procedure v4.2 — 12
    topologies, depth-budgeted loot, Myth-Seed-affinity boss/revelation), `rollWildernessWalk`
    (`wild-walk.js`, authored fresh — linear leg journey). Each → a walk data structure (segments=nodes,
    transitions=edges). Consumes the orphaned segment/dungeon/wilderness families.
  - **Synthesis contract** — deterministic half: `quest-hook.js` (`rollQuestHook`) + `prep-bundle.js`
    (`assemblePrepBundle` fires the 3 rollers + binds a hook per env + extracts ledger context;
    `prepBundleSummary`). LLM half: two staged prompts `Engine/00. _System/AI Prompts/synthesis-{harvest,
    reskin}.md` — Stage 1 harvests the throughline latent in the pile; Stage 2 emits a roll-keyed overlay
    (role/reskin/ties/reveal-plan). Multi-environment · staged · overlay+briefing.
  - **Prep state** (`src/world/prep.js`): `startPrep` binds each prepped environment to a **soft "rumored
    frontier"** map node (soft edge = the quest hook); `applyPrep` enriches frontiers from the synthesis
    overlays + writes soft new-canon; `lockOnContact` flips soft→hard on entry (Charter §8.4); recycle +
    prep-debt. `beginSession()` fires prep every session; `⎘ Prep handoff` button; `renderHexMap` draws
    soft frontiers dashed.
- **Headless tests**: `dev/verify-walk.mjs` (2667 assertions, all 28 topologies + wilderness),
  `dev/verify-prep-bundle.mjs` (32), `dev/verify-prep.mjs` (22).

### Changed
- **Compiler — `compile-tables.py` now emits `row[5]` = structured per-row cells** (the die col dropped),
  so multi-column prep tables (segment Type|Desc|Transition; encounter Name|Roster|Tactic; NPC/Quest)
  keep their columns. The compiled `tables.json` was previously LOSSY (merged columns into one string).
  Additive — `row[0..4]` unchanged; `rollTable().cells` added. Recompiled (334 tables).
- **EVENT-CONTRACT** (`applyEvent`) gains `prep_applied` (apply synthesis overlays) and `prep_contact`
  (lock a frontier on entry).
- **DESIGN.md / NEXT-STEPS.md** decision rows + build status for crit-lens, Session-Prep, synthesis.

### Fixed
- **Frontier node id collision** — soft frontiers were keyed by slug-of-name, so two sessions rolling
  the same evocative label collided on one node id (resurrecting recycled rumors). Now unique per-session
  ids (`frontier-s{session}-{idx}`). Caught by `verify-prep.mjs`.

### Deferred
- The **LLM synthesis itself** runs over the DM Bridge at play time (qualitative). Known tune item:
  is Stage-1 harvest good enough on summaries alone?
- **Browser render of soft frontiers** unverified this session (preview server sandbox-blocked) — confirm
  visually at playtest.
- (#6) fuller **orchestrator** (plausibility-from-frontier; NPC/Place depth rollers); soft-canon ledger
  *persistence* of overlays is wired but lock/recycle get their real exercise in play.
- **Improvement candidates** flagged: the `quest-*` + NPC-hook tables (v1).

---

## 2026-06-23 (session 2) — T2 Myth tables → d100 + Urban Pressure oracle + Crit-Magnitude spec

**Table-improvement pass T2 — completes the 3-tier pass** (T1 Place Gen, T3 NPC atoms already done).

### Added
- **`myth-costs` d12→d100** and **`myth-becomes-geography` d10→d100** — rebuilt from thin 10–12-row
  tables to full Commitment ladders (66/20/9/4/1, every row unique). What a legend demands/attracts/
  inflicts; how a myth scars the land. Originals → `Mythic Events/zz_Archive/`.
- **`urban-pressure`** — NEW d100 Commitment oracle (`Session Mechanics/Pressure/`): single-roll
  citywide ambient pressure for slow urban play, distinct from the `Urban Encounter v2.5` node
  generator. Fills the slot freed by the (session 1) `urban-encounters → tavern-encounters` rename,
  under a distinct `urban-pressure` id.
- **`docs/CRIT-MAGNITUDE.md`** — full spec of the Critical-Magnitude system (formalizes the
  `SPICE-CURVE` §3 one-liner from Adam's design call): nat 20 / nat 1 → a second d20 scaling
  Standard → Amplified → Mythic (= Local → Regional → Planar/Cosmic). 20/20 = permanent boon written
  to the Ledger as canon (the Light-of-Lathander shrine); 1/1 = mirror failure (dark + permanent at
  high stakes). Locks the **generic-engine vs situational-Myth-payload** seam.
- ~300 new table rows. All three tables content-only, **deliberately NOT wired** (rollable via the
  Oracle tab); wiring waits on the generic mythic-outcome oracle (CRIT-MAGNITUDE §4).

### Changed
- **`DESIGN.md`** — three decision rows under a new 2026-06-23 Crit-Magnitude section.
  **`DM-CHARTER.md`** §6 — new item 6 (critical magnitude, player-rolled second d20).
  **`SPICE-CURVE.md`** §3 — pointer to the new spec.
- Recompiled `tables.json` / `tables.js` → **332 tables**, 0 real bugs.

### Fixed
- Self-review near-dup: `myth-costs` "Demanded Repeat" (14) overlapped "Demanded Verdict" (64) on the
  "judge" example → reworded row 14.

### Deferred
- The **generic context-tagged mythic-outcome oracle** (combat / social / exploration / place-deed) —
  the missing middle that routes a 20/20 or 1/1 to the Myth suite. Specced in CRIT-MAGNITUDE §4; the
  next clean-session task.
- Two band-placement judgment calls from review left as Strange (`myth-costs` 95 "Slowing Subject",
  `myth-becomes-geography` 89 "Returning Path").
- Wiring all three new tables into live play.

---

## 2026-06-23 — NPC atoms → d300 + tavern rename + Place Gen fixes

### Added
- **Four d300 NPC tables** (Commitment, spice 198/60/27/12/3), replacing the DMG/2e `NPC Hook Megatable`:
  `npc-immediate-motivation`, `npc-bonds`, `npc-flaws-secrets`, `npc-job-board` — the highest-churn
  (per-NPC) hot path in the engine, now its deepest. Built via Workflow `npc-atoms-flesh-out` (36 agents:
  overgenerate by band + disjoint thematic lane → dedup/trim to exact counts in code; generators on
  Sonnet/low). 1,200 new rows.

### Changed
- **`urban-encounters` → `tavern-encounters`** — the d12+d8 table was always a tavern/interior table,
  not the citywide tool (that's `Urban Encounter v2.5`). The freed `urban-encounters` id is reserved for
  a future citywide random-pressure oracle.
- **`npc-bond` → `pc-bond`, `npc-flaws` → `pc-flaws`** — these were first-person *player* tables mislabeled
  with an `npc-` prefix; renamed (domain `Character Genesis / PC Traits`) and ids de-collided from the new
  `npc-bonds`.
- **Place Traits row 20** rebuilt to a distinct lighthouse/salvage trait (was a near-dupe of row 67).
- **Place-Secret rows 1–20** concretized from abstract category stubs to specific situations (match rows 21+).
- Recompiled `tables.json` / `tables.js` → **331 tables**; `check-manifest` OK.

### Fixed
- **Quick NPC Generator 2.0** had been feeding NPCs the first-person *player* flaw table (latent bug) →
  repointed to `npc-flaws-secrets` + `npc-bonds`. `NPC Honesty` prose cross-links repointed too.

### Deferred
- T2 Myth content (`Myth Costs`, `Myth Becomes Geography`); the new citywide urban-pressure table;
  wiring `npc-immediate-motivation` / `npc-job-board` into encounter-time flow.

### Retired
- `NPC Hook Megatable`, `NPC Secret` → `zz_Archive/` (superseded).

---

## 2026-06-22 — Place Gen table pass + Hometown bardo wiring

### Place Generation — full d100/d200 rebuild (9 tables, via workflow)

All Place Generation tables rebuilt from range-batched or thin rows to full spice-graded d100s
(one row per number, Spice Curve dist 66/20/9/4/1), with one table expanded to d200. Workflow
pattern established: parallel agents per table + validation agent.

- **Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status** — all now full d100 Commitment tables. Pre-spice
  originals archived to `Engine/…/Place Generation/zz_Archive/`.
- **Place Traits** — expanded from d20 (2-col, no Band) to d100 (4-col `| d100 | Band | Trait | Calamity |`).
  Calamity grows directly from its Trait (cause-and-effect). `table_class: Fork → Commitment`.
- **Place-Secret** — expanded from d20 to **d200** (first d200 table; `amax=200` in frontmatter,
  auto-derived by compile script). ~32% monster tie-ins (dragons, aboleths, fae, vampires, liches,
  hags, mind flayers, beholders, etc.). 4-col format `| d200 | Band | Hidden Mistake | Description |`.
- **Place Ruler Status row 93** (Strange): a dragon took the seat on a legal technicality three
  centuries ago; governance has been fair, the taxes are reasonable, and the Weavers' Guild petition
  from 287 years ago is still under review.
- `tables.json` / `tables.js` recompiled — 332 clean tables, 0 real bugs. d200 auto-derived.

### Hometown Bardo Wiring — 3 new beats in the creator flow

Three Track-B table rolls (place-master-setting → place-history → place-mythology) added after
Life and before the 9 world-genesis beats. Branch `feat/hometown-bardo`.

- **`data/creation-flow.js`** — 3 new GUIDE entries (`ht_setting`, `ht_history`, `ht_myth`).
- **`src/creator/bardo.js`** — `buildBardoSeq()` + `bardoSpine()` extended; 3 new functions
  (`bardoRollHometown`, `bardoHometownReroll`, `htMarkdown`); `bardoLog()` surfaces Hometown /
  Founded / Town Myth rows; `renderBardo()` now handles `{t:"hometown"}` with die + fragment +
  reroll (costs one shared reroll charge).
- **`src/world/play.js`** — `bindWorld()` seeds `world.seed.hometown` and writes a canon Ledger
  entry stripping markdown bold for storage.
- **`manifest.json`** — new owns + `rollTable` as call-time dep registered; `check-manifest OK`.

### Deferred
- Adam to **review all Place Gen tables** next session before compiling NPC/T2/T3 tables.
- T2 tables (Urban Encounters, Myth Costs, Myth Becomes Geography) — after the review pass.
- NPC atom tables (Demeanor, Mood, Under Pressure, etc.) — T3 pass pending.

---

## 2026-06-22 — The DM Charter (v1) — the flagship DM's operating contract

The DM-side behavior rules were scattered (Fragment veil, three-options, over-reveal discipline,
threat-signaling, agency). Consolidated into one constitution, authored from Adam's design
questionnaire this session. Branch `feat/dm-charter`. **Spec only — no app code touched.**

### Added
- **`docs/DM-CHARTER.md`** — the DM behavior spec behind the system prompt (Bridge + shipped DM).
  12 sections: the narrator (the **single voice across all lives** — bardo guide = waking DM),
  voice & prose, agency & handoff, **the slow drip**, danger/death/fairness, dice & mechanics
  surfacing, NPCs & the world's will, secrets/canon/pre-generated depth, tone & content, pacing
  & session management, integration, and open/flagged items.
- **3 draft tables (flagged for the table-improvement pass, NOT yet compiled):**
  - `Engine/…/Sentient NPCs/NPC Honesty.md` — a **2d10 bell-curve** disposition, *cannot-lie ↔
    cannot-tell-truth*, role-shifted; gated by motive (Secret/Fear/Leverage) × trust.
  - `Engine/…/Sentient NPCs/NPC Trust Lever.md` — d20, *what wins this NPC's trust* (the way in).
  - `Engine/…/Starting State/Starting State - World Depth.md` — deep secrets + over-the-horizon
    threats, pre-rolled at founding, **soft until contact → locked to canon on contact** (the
    foreshadowing fuel).

### Changed
- **`DESIGN.md`** — new dated section *Locked decisions (2026-06-22 — the DM Charter)*: 10 decision
  rows (single narrator voice, persona, prose, the slow drip, danger, dice surfacing, NPCs, secrets
  & canon, tone & content, pacing). The **single-voice** lock supersedes `NEW-GAME-FLOW`'s
  bardo/waking split at the level of *voice* (script still owns the bardo machinery).
- **`NEXT-STEPS.md`** — DM Charter track flipped ☐→☑ v1 specced; build follow-ups enumerated.

### Deferred
- **Recon, not rebuilt:** Secret/Fear/Leverage already exist (`_NPC Generation Raw` + template);
  the **hidden-`analog`** fiction-modeling pattern already exists in `_NPC Quick All-Stars` (100
  NPCs tagged Han Solo / Miranda Priestly / John Wick…). Formalize the field, don't reinvent it.
- **Not wired (specced in §12):** In-Media-Res escalation system (model: the *Low Tide* d20);
  pre-gen World Depth at founding; honesty/trust/`analog` onto the NPC generator + DM digest;
  a testable persona prompt over the Bridge; tutorial DM.
- Tables deliberately **uncompiled** — they're v1 drafts; recompile `tables.json` with the
  improvement pass, not before (avoids pulling half-baked rows into the artifact).

---

## 2026-06-22 — UI polish: gold corner filigree (the reskin's "approximated corners" gap)

- Extracted a real corner filigree from the decor sheets → `assets/borders/corner-{tl,tr,bl,br}.png`
  (4 oriented from one isolated piece). A reusable `.filigree` CSS class draws all four via a
  click-through `::after`; applied to the **bardo passage modal** now (bounded, clearly-framed surface).
  Graceful: a missing image just shows nothing.
- **Hex tiles prepped, not wired:** the `hex-tile-art` sheet (20 terrain hexes) was sliced + biome-mapped
  to `…/assets-iso/extracted/hexes/` (git-ignored). Deliberately **not** swapped into `renderHexMap` —
  photo tiles fight the deliberate *fraying-edge* aesthetic at the 460px minimap size; they belong in a
  future larger/zoomed map view. (Verify-blind constraint: preview sandbox couldn't run, so visual
  surfaces need an eyeball on refresh.)

---

## 2026-06-21 — Death & Rebirth, build step 6: the connected plane (loop complete)

The final step. All worlds are now **regions of one shared plane**, and a successor wakes far from
where the last soul fell. With this, the whole Death & Rebirth loop (steps 1–7) is built.

### Added (in `src/world/state.js`)
- **`regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion`** — each world carries a coarse
  `region {q,r}` coordinate spiralling outward from the plane centre; `bindWorld` places each new
  region; distance reuses `hexDist`.
- **`spawnSuccessorOnPlane`** (`fate.js`) — on death the successor wakes in the region **most distant**
  from where they fell (or stays if the plane has only one region so far). `closeBardo` now routes here.
- Shelf reframed as **"Regions of the plane"** with per-card distance hints (`render.js`).

### Changed
- **Migration is ADDITIVE** (supersedes the spec's "bank-and-restart"): `migrateAll` tags any
  region-less world with a position and sets a `U.plane={version:3}` marker — **nothing is reset,
  merged, or banked**; the `v2` storage key is kept. Chosen during build as the safe path that
  preserves all existing saves (`DESIGN.md` row updated).
- **`dev/verify-plane.mjs`** (14) — spiral distinctness, distance, farthest-region, additive
  migration, placement, successor-to-distant-region, single-region fallback. `check-manifest` clean
  (33 modules, 6 known warnings).

### Notes (emergent, intended)
- The bardo gap advances the death region's clock by up to 49 days, so **short-decay corpses
  (den/travelled) are usually gone** by the time anyone can return — only sealed/wild bodies keep
  their loot through the bardo. Thematic; kept.
- **Death & Rebirth steps 1–7 are all done — the loop is complete.** Remaining are polish: a region-map
  SVG + coarse region-to-region travel, authored vision/affinity tables, and wiring the icon assets.

---

## 2026-06-21 — Death & Rebirth, build step 5: corpse & loot decay

A fallen character's body and effects now linger in the world — and rot, or get carried off, on a
clock. Reach the body in time and the loot is yours.

### Added (in `src/world/rebirth.js`, now layer 2)
- **`killCharacter`** mints **`c.corpse`** — the carried items + gold and a rolled environmental
  **`context`** (`CORPSE_CONTEXTS`: sealed 120d / wild 30d / travelled 7d / den 2d) — and writes it
  to canon at the fall site.
- **`corpseStatus(w,c)`** decays **fresh → disturbed → gone** by elapsed *in-world* days (off
  `c.fellWhen`) vs the context's window; **`corpsesAt(w,node)`** surfaces still-recoverable bodies;
  **`claimCorpse(w,c,taker)`** transfers the haul to a living PC and marks it looted.
- **`recoverFallen`** (`fate.js`) + a **"⚰ Recover … effects"** button on the character panel,
  shown only when a living PC stands where a recoverable body lies.

### Changed
- `world.rebirth` reclassified **layer 4 → 2** (it only depends on L1/L2), so `render` can query
  `corpsesAt` with no layer inversion. `dev/verify-saga.mjs` → 45 assertions (corpse decay/claim);
  `dev/verify-rebirth-flow.mjs` → 19 (corpse at death + recovery through the real graph).
  `check-manifest` clean (33 modules, only the 6 pre-existing warnings).

### Notes
- Draft `CORPSE_CONTEXTS` (rolled); could later read the place / nearby pressures instead.
- **Death & Rebirth steps 1–5 + 7 are done — the loop is fully playable within the per-world model.**
  Only step 6 (connected plane / Universe v3) remains, for cross-region successor spawning.

---

## 2026-06-21 — Death & Rebirth, build step 4: faction proximity at creation

A character is now born near a local power — and a successor can be born inside a rival of the dead
PC's allies.

### Added
- **`rollFactionProximity(w,c)` + `factionKind(f)`** (`src/engine/world-gen.js`, called from `rollEntry`):
  rolls the relationship (**tie 55% > member 25% > none 20%**) and, if any, picks WHICH faction
  **weighted by the class's archetype** (`CLASS_FACTION_AFFINITY` × the faction's `factionKind`, read
  from its Method) — any class can still land near any power. Records `c.entry.proximity`, adds the
  faction to the opening bundle as a Friend, and writes a `canon`/`proximity` ledger entry.
- **`METHOD_KIND` + `CLASS_FACTION_AFFINITY`** data (`data/srd-creator.js`) — draft affinity vocabulary.
- **`dev/verify-proximity.mjs`** — 12 assertions: kind classification, class-weighted choice
  (Cleric → divine >50%), the tie>member>none distribution, and `rollEntry` integration + ledger.

### Changed
- Registered the new symbols (manifest owns/callTimeDeps). `check-manifest` clean (33 modules).

---

## 2026-06-21 — Death & Rebirth, build step 7: the bardo passage (death loop now playable)

The engine pieces (steps 1–3) are now wired into an actual death. Killing a character runs the whole
bardo and shows it; the loop plays end-to-end.

### Changed
- **`src/world/fate.js` REWORKED** — the d20 "spawn back into the same adventure" is **retired**.
  - `killCharacter` stamps **`c.fellWhen`** (the in-world clock, not `Date.now()`) and writes the
    fall to the ledger as `canon`/`death`.
  - `openBardo` runs **`runBardo`** (gap drift + 14 visions), then `renderBardoPassage` reveals the
    days passed + the 7 peaceful / 7 wrathful vision **Fragments** (player sees fragments only).
  - `closeBardo` rolls a **brand-new successor** (no inherited quests).
- **`genesis.html`** — repurposed `#fateModal` → `#bardoModal` (a scrollable passage), added bardo/
  vision CSS, removed the now-dead `FATE_THRESHOLD` const.

### Added
- **`dev/verify-rebirth-flow.mjs`** — 14 assertions, full-app jsdom: reworked fns present + legacy
  spawn-back gone, in-world `fellWhen`, death canon, visions dreamt, clock advanced, passage rendered,
  close → successor.

### Notes
- `check-manifest` clean (33 modules). The successor still spawns **in the same world** until the
  connected plane (step 6) lands — the only remaining gap to the full cross-region loop.
- Remaining Death & Rebirth steps: **4** (faction proximity at creation), **5** (corpse/loot decay),
  **6** (Universe v3). Steps 1–3 + 7 done.

---

## 2026-06-21 — Death & Rebirth, build step 3: the 14 vision-rolls

The Chönyi Bardo. While the hero is between lives, the world dreams its direction around the seven
things that mattered to them — and the next soul wakes to faint Fragments of it.

### Added (in `src/world/rebirth.js`)
- **`bardoVisions(w,c)`** — 7 peaceful + 7 wrathful visions over the dead PC's Saga (padded to 7
  from the faction web / gazetteer if the life was short); peaceful days precede wrathful.
- **`rollVision`** — each vision ~50% comes to pass. A fired vision **mutates an existing structure**
  via **`applyVision`** (faction agenda clock ±1, NPC/enemy gazetteer `fate` = risen/fallen, place
  `fate` = prospered/ruined; threads recorded), writes the **DM-side truth** to the ledger as a
  `drift`/`bardo-vision` entry, and surfaces only a **6–10 word Fragment** to the player.
- **`runBardo(w,c)`** — the orchestrator: refreshSaga → bardoGap (time + drift) → bardoVisions,
  storing the result on `c.visions` for the successor's passage.
- **`VISION_OUTCOMES` / `VISION_QUIET`** — draft peaceful/wrathful flavor (per Adam's call: mechanical
  effects + draft flavor now, an authored spice-graded vision table later).

### Changed
- `dev/verify-saga.mjs` now 34 assertions (14-vision count, peaceful-before-wrathful ordering,
  fragment-vs-truth split, ledger writes, faction-clock ± mutation, place-ruin, unfired-no-op,
  runBardo orchestration). `check-manifest` clean (33 modules); full-app jsdom boot runs the whole
  bardo through the real `rollStartingState` (31-day gap, 14 visions, 9 fired, Saga 7).

### Notes
- Not yet surfaced in UI — `c.visions` holds the Fragments; build step 7 (`fate.js` rework) routes
  deaths into `runBardo` and renders the passage.

---

## 2026-06-21 — Death & Rebirth, build step 2: the bardo gap + drift

The time between lives. When a hero dies, the world now moves on before the next soul enters.

### Added
- **`src/world/rebirth.js`** — the new death-flow module (visions + corpse will grow here).
  `rollBardoGap()` rolls a **0–49 in-world-day** triangular bell (mode ~3–4 weeks, rare instant/full
  tails — Tibetan *Bardo Thodol*'s 7×7). `bardoGap(w,[days])` advances the world clock by the gap and
  **turns the faction web once per elapsed week** via the existing `ssFactionTurn`, writing a `bardo`
  transition to the ledger — so a successor wakes into a genuinely later, drifted world.
- `dev/verify-saga.mjs` extended (now 20 assertions) — gap range/mean, explicit-day application,
  clock advance, one-turn-per-week, the `bardo` ledger entry, and the 0-day instant exit.

### Changed
- Registered `world.rebirth` (manifest + `<script>` + `check-manifest.py` LAYER L4). `check-manifest`
  clean — **33 modules**; full-app jsdom boot runs `bardoGap` through the real `rollStartingState` /
  `ssFactionTurn` (day 3→17, 2 turns, ledger writes).

### Notes
- Not yet wired into the death UI — `bardoGap` is the mechanic; build step 7 (`fate.js` rework) routes
  actual deaths through it, and step 3 layers the 14 vision-rolls on top of the gap.

---

## 2026-06-21 — Death & Rebirth, build step 1: Saga tracking

First code for the death loop. A character's **Saga** — their most significant entities — is now
derived from world state, ready for the bardo vision-rolls (step 3) to act on.

### Added
- **`src/world/saga.js`** (`computeSaga`/`refreshSaga`/`sagaKey`/`SAGA_MAX`) — ranks a character's
  top-7 entities (enemies / NPCs / factions / places / threads) from the ledger + gazetteer + faction
  web by **stake × frequency × recency**. A PC's own life-NPCs and the faction they stand against out-
  rank world-generic entries; `fellWhere` joins as a high-stake place once dead. Pure read; deterministic.
- **`dev/verify-saga.mjs`** — 12 logic assertions (vm-loaded, no DOM): capping, enemy/thread/faction
  capture, personal-out-ranks-stranger, standing-faction in top 3, persistence, determinism.

### Changed
- `cgBind` seeds `c.saga` at birth; `beginSession` refreshes each living PC's Saga.
- Registered `world.saga` (manifest + `<script>` in load order + `check-manifest.py` LAYER L2).
  `check-manifest` clean — **32 modules**; full-app jsdom boot loads the new module in order and runs
  `refreshSaga` through the real graph.

---

## 2026-06-21 — Death & Rebirth design lock (spec only, no code)

A design session locking the **persistent-sandbox death loop**. No code changed — captured as a new
`system-spec` so the next session builds from a blueprint.

### Added
- **`docs/DEATH-AND-REBIRTH.md`** — the full spec: death-is-expected posture, the **49-day bardo gap**
  (0–49 in-world-day bell roll) that drifts the world via `ssFactionTurn`, the **14 peaceful/wrathful
  vision-rolls** against the dead PC's **Saga** (their 7 most significant ledger entities) surfaced to
  the player as Fragments, optional chosen-one reincarnation memory, **class-weighted faction proximity**
  at creation, **corpse/loot decay** by clock+context, DM-driven companion rescue, and the
  **connected plane (Universe v3)** successor model. Includes a 7-step build order.

### Changed
- **`DESIGN.md`** — new "Locked decisions (2026-06-21, session 2 — death & rebirth)" section (12 rows),
  incl. **XP threshold curve = SRD 5.2.1 exactly** (resolves the `ADVANCEMENT.md` open question — slow
  climb is intended given death-expected play).
- **`ADVANCEMENT.md`** — threshold-curve open question marked RESOLVED (SRD-exact).
- **`NEXT-STEPS.md`** — new Death & Rebirth track with build order; XP-curve step flipped from a design
  call to a mechanical "author the SRD table" task.
- **`docs/README.md`** — indexed the new spec.

### Notes / reconciliation flagged for the build
- `src/world/fate.js`'s d20≥11 "spawn back into the same adventure" is **superseded** — death will route
  through the bardo to full new creation; the modal/FX get repurposed. `fellAt` must become an in-world
  clock stamp (currently `Date.now()`).
- The existing faction generator (`Starting State - Factions.md` + `rollStartingState`/`ssFactionTurn`)
  is **sufficient** — no new faction generator needed; the gap is the class-weighted proximity roll at
  creation.

---

## 2026-06-21 — Ivalice UI reskin — parchment-on-stone, light & luxurious

Reskinned the whole interface to the **Final Fantasy Tactics: The Ivalice Chronicles** look from
Adam's ChatGPT concept sketches + texture atlas (`ui-sketches/ivalice-style/`). The app is now
**light**: warm parchment pages with real paper grain floating on a dark textured stone ground;
**Cinzel** (engraved gold display caps) + **EB Garamond** (sepia body); a fixed top breadcrumb bar
(compass gem · gold small-caps crumbs, current in steel-blue); gold double-borders, parchment pill
buttons, and a steel-blue accent for active/links/sigils. Built across all five concept surfaces +
the shelf, verified each in-browser.

### Added / Changed
- **Design tokens** remapped to a parchment/stone/gold/steel palette (legacy `--vellum*` aliased so
  existing panels flipped to cream automatically). Google Fonts (Cinzel + EB Garamond) with serif
  fallback. `#wakeFade` and contrast cleanup of leftover dark-theme hardcodes (e.g. selected cards).
- **Textures:** sliced Adam's atlas into `assets/textures/parchment.jpg` (panel grain), `stone.jpg`
  (ground), `compass.png` (motif); wired parchment under the cream gradient on every page and stone
  under the warm radial on the body.
- **Surfaces:** start screen (concept #1) · soul-forging card grid + "So far" inset (#2) · chat-first
  play view — icon rail, slate scene-pill, sigil-gutter chronicle, parchment choice pills, fused
  input (#3) · character panel — portrait, ability boxes, HP/AC badges, skills/inventory columns (#4)
  · world-genesis engraved omen die (#5) · universe shelf cards · top nav rail.
- `render.js` markup updated (scene pill, message sigils, character panel, start page); `chrome.js`
  breadcrumb wired to `showTab`.

### Notes
- Fonts load from Google Fonts (online); they degrade to system serif offline — bundle the woff2
  locally later for true offline. Corner *filigree* is approximated (clean gold double-borders) —
  real SVG flourishes are a future polish. check-manifest clean (31 modules); 21/21 render + 29/29
  bridge tests still pass.

---

## 2026-06-21 — Live playtest pass — creator UX + DM-bridge robustness

Fixes from Adam's first live DM-bridge playtest:
- **Creator:** spell/cantrip cards now show the **full** text in a viewport-clamped tooltip (truncated native tooltip retired; `gen-spells-slim.py` emits full `text`); skill/equipment/spell/choice blocks are a responsive **grid** of title+description cards; **"Begin" lands straight on the first choice** (removed the redundant threshold/soul gates); the running creation list moved to a right-hand **"So far"** column with the "This Is Your Life" rolls **itemized**; **inline dice in life events roll at roll-time and bank gold** into starting gp (`cgMakeEvent` / `cgResolveInlineDice`); the "Wanderer (roll again)" NPC sub-roll resolves.
- **DM bridge:** the app waits up to **5 min** for a live DM instead of hanging on "considering" (and posts a clear message if no DM is watching); the bridge **re-creates its mailbox dir before any write** (a deleted `.dm/` no longer 500s POSTs — the "unreachable" bug); the auto-opening turn is **`hidden`** so its meta-prompt doesn't show in chat; runbook says to run the DM on **Sonnet**.

---

## 2026-06-21 — Chat-first World view + the waking transition (NEW-GAME-FLOW §9, the substantive part)

Built the locked-but-unbuilt chat-first interface from `NEW-GAME-FLOW.md` §9 — the World view is no longer a long scroll of sections; it's the **DM conversation, centered**, with the world's panels in a **left icon rail** that **slide in beside the chat** (Disco Elysium-style). Plus the **waking cinematic**: the bardo fades to black and dissolves into the DM's opening words. From live character-creation playtest feedback (items 5 + 6). `check-manifest` clean (31 modules). Verified in-browser (Chrome): rail, column-slide, all panels, no console errors.

### Added / Changed
- **`src/world/render.js`** — `renderWorld` rewritten into the chat-first shell: a scene header (place + diegetic clock), the chat column (opening → DM feed → a collapsed "⚙ World & transitions" disclosure holding the explore/time controls), and a slide-in `.panel-col`. New helpers: `gameRail` (the 6 granular icons — **Story · Character · Map · Ledger · Gazetteer · Powers**, each gated by the Curve of Revelation, + Universe/Oracle), `worldActions`, `gamePanelContent`, `gazPanel`, `renderCharacterPanel` (the full sheet as a panel), `openPanel` (the rail router).
- **`src/world/play.js`** — `wakeIntoWorld()` (the §9 fade: black → land in Story → fade up) + `autoOpenScene()` (if the DM bridge is live, auto-fires the opening turn so the player wakes into the DM's words; silent no-op otherwise — the rolled opening stands in). `enterWorld` resets the open panel.
- **`src/creator/sheet.js`** — `cgBind` now finishes through `wakeIntoWorld()` instead of a bare render+toast. **`src/creator/bardo.js`** — `bardoFound` raises the fade before assembling world+soul (no flash).
- **`src/ui/chrome.js`** — `showTab('world')` toggles `.wrap.ingame` (hides the top-level nav rail; the in-world rail replaces it). **`src/state.js`** — `GS.gamePanel` + `GS.waking`.
- **CSS + `#wakeFade` overlay** in `genesis.html`; responsive (rail → top strip, panes stack under 760px).

### Notes
- The waking auto-opening uses the DM Bridge; with the bridge down it degrades gracefully to the rolled opening bundle.
- Old characters' stored headlines may still show raw dice (e.g. "(+2d6 gp)") — that's pre-fix data; new souls resolve it (see the creator-fixes entry).

---

## 2026-06-21 — DM Bridge v1 — the AI-DM integration harness (closes the play loop)

Built the dev integration harness from `DM-BRIDGE.md`: the app and an AI DM (Claude Code, subscription-backed → no metered tokens) now run together over a tiny local bridge, replacing the clipboard back-and-forth. The DM returns narration + **typed `EVENT-CONTRACT` events**; the app applies them through its **own existing mutators** (the script stays the sole state owner — anti-drift). All five build-order steps shipped. `check-manifest` clean (**31 modules**, only the 7 known layer-inversion warns).

### Added
- **`dev/dm-bridge.py`** — the bridge: a dumb mailbox + static server (stdlib only, replaces `python3 -m http.server`). Holds `.dm/turn-*.json` / `response-*.json` / `state.json`; routes `POST /turn`, `GET /response?turnId` (204 pending / 200 ready), `POST/GET /state`, `POST /reset`, plus `GET /dm/turns` (pending list for the loop) and `/dm/health`. **No game logic** — the mutators are never forked. Serves everything `Cache-Control: no-store` so a stale cached module never silently breaks the app mid-dev (the ~30 classic `<script>` files mean one stale `state.js`/`render.js` makes a tab look dead — this kills that trap without per-edit version strings).
- **`src/world/dm.js`** (`world.dm`, layer 4) — the bridge client (`dmDigest` = the structured JSON twin of `handToDM`; `sendTurn` / `pollResponse` / `applyResponse` / `postState`; `dmSend` / `dmRollFor` for the player actions + roll handshake) **and `applyEvent(w,e)`** — the EVENT-CONTRACT runtime: a `switch` on every event type dispatching to the real mutators (`addLedger` / `addNode` / faction+front clocks). Unknown types `console.warn` + no-op (forward-compatible). **Reused by `ADVANCEMENT`/`DIFFICULTY` later.**
- **`src/world/render.js`** — `renderDMFeed(w)` + `escHtml`: the **"The DM"** section in the World view — a scrolling chronicle, the "considering…" indicator, the roll-handshake button, the three-options `ask`, and the action box. Shown once a soul is in play.
- **`src/world/state.js`** — `dmLogOf` / `pushDmLog` (the persisted narration feed, on `w.dmlog`). **`src/state.js`** — `GS.dm` transient.
- **`dev/fixtures/`** — 4 turn/response pairs (social / travel / combat / combat-resolve) covering `fact_canonized` + `clock_advanced` + `ask`, `discovery` (mints a node) + front clock, the roll handshake (`rollRequest`, no events), and `encounter_resolved` + `kill` + `adjudication`. They double as the test corpus.
- **CSS** for the feed; `.dm/` git-ignored.

### Verified
- **`dev/verify-bridge.py` — 28/28**: transport + contract (POST /turn echoes id, /response 204→200, static serve, /state round-trip, every fixture's `events[]` conform to the envelope, DM responses carry no `rolls[]`). Dependency-free.
- **`dev/verify-dm-events.mjs` — 21/21** (jsdom, full-app load — every module in real document order): `applyEvent` through the real mutators (clocks advance by exact delta, `discovery` mints a node, `adjudication` writes a canon precedent, unknown types no-op), `dmDigest()` reflects post-event state, **and** the DM-feed render (`renderDMFeed`/`renderWorld` produce the "The DM" panel + action box + roll-handshake button). Doubles as the boot smoke-test — all DM-bridge globals present after the full load, no throw.

### Deferred (v1 gaps, by design)
- **No time-advance event** — the in-world clock still moves only via the existing transition controls (Travel / Rest / Montage). A DM that narrates travel reminds the player to take the transition.
- **Declared events only** — the `detected`-from-state-delta migration stays `EVENT-CONTRACT.md`'s job. `clockId` is fuzzy-matched to a faction (name slug) / front (danger slug) until stable clock ids land with the detected work. XP/leveling consequences are recorded to the ledger but not computed (that's `ADVANCEMENT.md`).

---

## 2026-06-21 — `CLASS_PROGRESSION` data (levels 1–20) — the leveling spine's first build step

Built the load-bearing data task from the advancement spec family (`ADVANCEMENT.md` step 1): structured levels-1–20 advancement for all 12 base classes. Until now only level 1 was wired (`data/srd-creator.js`); this is the data real leveling and richer DM lookups stand on. First Claude Code session. Commit `f9e5601`.

### Added
- **`data/class-progression.js`** (generated, ~144 KB) → `const CLASS_PROGRESSION`, 12 classes × levels 1–20, 254 feature entries. Per level: `pb`, `features[]` (`{name, text}` with **full SRD feature text embedded** — the chosen depth), and for casters `cantrips` / `prepared` / `slots[]` (full+half) or `pactSlots`/`pactSlotLevel`/`invocationsKnown` (Warlock pact); Wizard also carries `spellbook` (6 +2/level, distinct from `prepared`). Class resource scalers where canonical: Barbarian rage uses + damage, Bard inspiration die, Fighter action surge + indomitable, Monk martial-arts die + focus points + unarmored movement, Rogue sneak-attack dice, Sorcerer sorcery points.
- **`build/gen-class-progression.py`** — the generator. **Parse-then-validate**: the SRD's per-level numeric grids survived OCR as space-separated rows (em-dash = empty), so it parses the real `classes.md` grids for 7/8 casters, then **asserts the parsed spell-slot columns equal authored canonical matrices** (full / half / pact) — OCR corruption fails the build loudly. Feature names + prose parse from the clean `### Level N:` headings. Ranger's grid is the one too OCR-scrambled to parse, so it's authored from the Paladin-validated half-caster canon (the substitution is the validation).

### Changed
- **`manifest.json` + `genesis.html`** — registered `data.class-progression` (owns `CLASS_PROGRESSION`, layer 0) in `loadOrder`, the module list, and the `<script>` tags; added to `check-manifest.py`'s LAYER map. `check-manifest` clean: **30 modules, 215 owned symbols** (only the 6 known, documented layer-inversion warnings).

### Verified
- **Headless jsdom harness, 797/797 green** — loads the real `genesis.html` (all modules in document order), then asserts: 12×20 coverage, PB per level, ASI at 4/8/12/16 (Fighter +6/14), subclass-feature levels, caster classification, spell-slot anchors (full/half/pact), cantrip growth, resource scalers, embedded-text presence + no grid leakage, and **L1 reconciliation with `srd-creator.js` `CLASS_CASTING`** (creator cantrip/prepared counts match the progression's L1; the reconciliation surfaced + correctly models Wizard's spellbook-vs-prepared split).

### Notes / deferred
- **Recurring features handled as canonical constants, not parsed** — the SRD prints each feature's prose once (first appearance) and the summary table (which repeats ASI/Expertise/etc.) is too OCR-corrupted to parse (Fighter's lost its level column entirely). So ASI (4/8/12/16, +Fighter 6/14), the few class repeats (Bard/Rogue Expertise, Sorcerer Metamagic, Warlock higher Mystic Arcana), and Wizard's absent-from-source subclass levels (6/10/14) are injected from 2024 canon and asserted by the harness.
- **Out of scope (by design):** subclass feature *content* (only base classes are wired; generic "Subclass feature" markers stand in), the XP-to-level **threshold curve** (still its own decision per `ADVANCEMENT.md` — make before leveling is wired), and any UI / level-up plumbing (data + tests only).

---

## 2026-06-21 — Version control: git repo + `CLAUDE.md` (Claude Code readiness)

Put Genesis under version control and laid down a cross-surface operating contract, so future code work can flow through either Cowork or Claude Code with a safety net.

### Added
- **`Obsidian Files/Genesis/` is now a local git repo.** First commit `6428d47` captures the modular-v0.3 state (924 files, ~9M); `d7f4f76` adds the table artifacts (below). No remote yet — add a GitHub remote later (needs a token; local commits need none → keep it **private**, the ignored PDFs aside).
- **`.gitignore`** — ignores the scanned rulebook **PDFs** (~705M, copyrighted, never push), `node_modules/`, `.DS_Store`, and `Archive/` (pre-git manual backups — git history replaces them). Everything else is tracked.
- **Repo `CLAUDE.md`** (root) — the cross-surface contract both Claude Code *and* the Cowork `genesis` skill read: run command, the classic-script/manifest/`GS` architecture, the command table (check-manifest / compile-tables / gen-spells-slim / jsdom), the non-negotiable disciplines, the `docs/` map, and gotchas. Points at `docs/`, doesn't duplicate.

### Changed
- **`tables.json` / `tables.js` are tracked** (reversed an initial ignore). Rationale: a fresh checkout should always run (the Oracle tab needs `tables.js`) and compile output stays diff-able/bisectable. Still generated — never hand-edit; regenerate with `compile-tables.py --emit`.

---

## 2026-06-21 (docs) — Docs → `docs/`, and the combat/XP/advancement spec family

Reorganized the doc tree and laid down the design specs for the engine's "meat and potatoes": combat, XP, leveling, and the DM↔script event contract.

### Changed
- **All design docs moved to `docs/`.** The thirteen narrative/design/spec/operational docs left the repo root; only `README.md` (front door) and `table-registry.md` (build artifact) stay at root. References fixed everywhere: `README.md`, and the comment/`desc` pointers in `genesis.html`, `src/world/state.js`, `src/state.js`, `src/engine/hexmap.js`, `build/check-manifest.py`, `manifest.json` (all `X.md` → `docs/X.md`). No `[](file.md)` links existed, so sibling cross-references stayed valid. Build green after (`check-manifest` OK, manifest still valid JSON). **The `genesis` skill references several docs by name — it's a read-only cache here, so Adam updates it via Settings → Capabilities (change-list provided).**
- New `docs/README.md` — the docs index + the `type:` genre taxonomy (decision-log / system-spec / research / operational / audit) + the repo-root-relative path convention.

### Added
- **`docs/EVENT-CONTRACT.md`** (`system-spec`) — the DM↔script interface: typed events, the **detected > declared** principle, the event taxonomy, meaningful-choice-as-state-fork, and adjudication-as-precedent. The spine the other three reference.
- **`docs/ADVANCEMENT.md`** (`system-spec`) — ledger-spine XP economy (combat as a gated modifier), XP-threshold leveling applied on a rest, creativity rewarded off the XP axis (Inspiration / better outcomes / failure-as-engagement).
- **`docs/DIFFICULTY.md`** (`system-spec`) — fixed-by-default regional power bands, narrative-exception scaling (`corruption_vector`), mandatory threat-signaling, and murder-hobo answered by named responses via the existing faction-clock machinery.
- **`docs/COMBAT.md`** (`system-spec`, sketch) — theater-of-mind zone-band 5.5 engine, cover from generator terrain specs, scene objectification serving tactics/escape/clever-outs; engine deferred (Fable), event surface specced now.
- Five new decision rows in `DESIGN.md` (advancement / difficulty / combat / event-contract / docs-org).

---

## 2026-06-21 (later) — Guided creator: skills, equipment, spells & feat walkthrough + multi-die display

The bardo creator now walks the choices it used to auto-generate. After scores, four new beats — **Skills → Kit → Spells → Feat** — let the player make the picks the 2024 PHB asks for, each with a 🎲 "choose for me" shortcut (the three-options-+-something-else ethos). Ability-score rolls now show the four d6 they came from.

### Added
- **`data/srd-creator.js`** — curated SRD/2024-PHB class data: `CLASS_SKILLS` (n-from-list), `CLASS_KIT` (starting-equipment A/B/gold packages), `CLASS_CASTING` (L1 cantrip/spell counts + spell list + ability), `ALL_SKILLS`. Transcribed + verified against `Reference/SRD-Data/classes.md`.
- **`data/spells-slim.js`** (generated) — cantrip + level-1 picker surface (name/level/school/classes/flavor). Built by **`build/gen-spells-slim.py`** from `spells.json`; 84 spells, ~17 KB. Loaded as a `<script>` global (file:// can't fetch).
- **Four bardo steps** (`src/creator/bardo.js`): `skills` (class picks, minus background dupes), `equipment` (A/B/gold), `spells` (caster-only; non-casters get a graceful "no magic at level 1" pass; half-casters with 0 cantrips handled), and `feat` (the background **origin feat** — Magic Initiate resolves 2 cantrips + 1 L1 spell from its list; Skilled resolves 3 skills excluding bg/class dupes; Alert/Savage Attacker just confirm). Each with a "choose for me" auto-fill. Running bardo-log shows the picks.
- **`ORIGIN_FEATS`** (`data/srd-creator.js`) — the four origin feats the backgrounds use, with their player choices described declaratively.
- **Multi-die roll display.** `roll4d6breakdown()` keeps the four d6 (and which was dropped); the bardo score slots and the manual Sheet's "YOUR ROLLS" strip render the dice (dropped one struck through) instead of only the total. `miniDice()` helper + `.score-dice` CSS.

### Changed
- **Sheet finalize carries the choices.** `cgSheetExtras()` (shared by `cgBind` + `soulFromCGEN`) merges background + class **+ feat** skills (deduped) and adds `classSkills`, `inventory`, `gold`, `kit`, `cantrips`, `spells`, `spellAbility`, plus `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility`. The manual Sheet's punt line now points to the guided creator instead of deferring everything to the DM.
- **Verification:** 62/62 headless jsdom assertions (real `genesis.html`, all modules in document order) — skill/kit/spell/feat auto-fill across Wizard, Ranger (edge), Fighter, Rogue + feat cases (Magic Initiate Cleric/Wizard, Skilled, Alert, Savage Attacker); the 4d6 breakdown (4 dice, drops lowest, total matches); sheet shape; all four render branches; Bard choose-any-3. `check-manifest` OK (29 modules, 214 owned symbols).

---

## 2026-06-21 — De-monolithing complete, scaling guardrails, creator polish

The big arc: `genesis.html` went from a 2047-line monolith to a **449-line shell + 27 modules**, plus an architecture audit, two scaling guardrails, and a round of creator/dice work.

### Added
- **Full modularization (passes 2–8).** Carved all logic out of `genesis.html` into classic-script modules: the data layer; the engine (`tables` / `world-gen` / `hexmap` / `compiled`); `world.state` + `world.render`; the UI (`oracle` / `chrome` / `dice`); the whole creator (`scores` / `life` / `sheet` / `bardo` / `roster`); and the app core (`world.play` / `fate` / `handoff`). `genesis.html` is now HTML/CSS + init + a few consts.
- **`GS` state container** (`src/state.js`) — all transient mutable state (`CGEN`/`BARDO`/`CG_DRAG`/`FATE_CTX`/`SEED`/`ORC`) lives behind one window-level `GS` object (~270 references migrated via AST). New mutable state goes here. `U` (persistent universe) keeps its own accessor layer.
- **`SCALING.md`** — architecture/scaling audit: classic-scripts vs ES-modules, the state-discipline question, and *when* to migrate (with the eventual graphics engine, not before).
- **Canon Wandering Souls** (`data/souls-canon.js` → `CANON_SOULS`, seeded idempotently by `world.state.seedCanonSouls`). Shipped as source so Adam's characters are canon; end-users' banked souls stay local; the roster is the union. Entries: **Robin Hartley, Brunn Graniteback, Milo**.
- **Pronoun picker** in character creation (`data/pronouns.js`: `PRONOUN_SETS` + `pronounSet`; they / she / he). Appears in both the bardo and the Sheet; flows to the banked soul, the in-play character, and the **DM handoff** (`I am playing X (he / him) — …`). Defaults to they/them.
- **Dice visual engine** (`src/ui/dice.js`: `dieRoll` + `diceSpice`) — the tumble-then-settle animation + spice "juice" consolidated into one place; the four contexts (ritual / creation / fate) delegate to it. First improvement shipped: **tumble-decay** (flips decelerate into rest) + a **settle-pop** bounce.
- **`check-manifest` guardrails:** a **layer-direction check** (warn-mode — flags calls into a higher layer; flips to hard-error once the 6 known inversions are cleaned) and an **HTML-tag check** (every manifest `loadOrder` entry must have a `<script>` tag in `genesis.html`; missing = hard error).

### Changed
- **Ability-score allocation** on the Sheet is now an explicit **Best-for-class / As-rolled toggle** (active mode highlighted) instead of a single button.
- **Retired the one-off `ROBIN_SEED`** into the `CANON_SOULS` data layer + the general `seedCanonSouls` seeder.

### Fixed
- **Canon souls weren't seeding in the browser.** `data/souls-canon.js` was in the manifest `loadOrder` but had **no `<script>` tag** in `genesis.html`, so `CANON_SOULS` was undefined and the seeder silently no-op'd — Robin/Brunn never actually appeared. Added the tag (now Robin/Brunn/Milo all seed); the new HTML-tag check prevents recurrence.
- **The Sheet's "Best for class" button did nothing** from a fresh roll, because rolling already auto-applied best — so re-applying it produced the identical result. Resolved by the toggle above (the allocation math was always correct).

### Deferred (tracked in `NEXT-STEPS.md` / `SCALING.md`)
- Clean the 6 layer-inversion warnings → flip the layer-check to hard-error.
- Relocate the last data consts (`STAGES` / `GUIDE` / `LIFE_STEP`) out of the shell into a data module; `FATE_THRESHOLD` → `fate.js`. Sweep dead `cgResetScores`.
- Feature backlog: deeper creator (skills / equipment / spells from SRD-Data); multi-die roll display; "retire character" action; further dice flourishes.
- ES-module migration + inline-handler rebind — paired with the eventual graphics engine.
