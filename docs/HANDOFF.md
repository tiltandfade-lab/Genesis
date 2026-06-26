---
type: session-handoff
project: Genesis
updated: 2026-06-26
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-06-26) — CODEX track CLOSED: loose ends tied off + consistency review [Claude Code]

**The Codex is done.** Phase 6 (the UI panel) shipped 2026-06-25 (`548b54b`) alongside the
`codexProvenanceReport` ratio test + world-gen place grounding (`a02840a`); the live re-playtest flipped
the mechanical-vs-invented baseline **~20% → 60–82%** — the anti-drift loop is validated end-to-end. (NB:
the relocation entry below pre-dates that and listed Phase 6 as "next" — it's done.)

This session closed the two remaining follow-ups on branch **`feat/codex-loose-ends`**, after a
cross-system **consistency review** (architecture + style across Codex / Session-Prep / Death & Rebirth /
the event runtime — verdict: **coherent**; one drift, `rollVision` mutating despite the `roll*` prefix,
chipped as a `fireVision` rename):
- **Soft-pool eviction cap** — `codexEvictSoft(w,{cap,keepIds})` (`src/world/codex.js`, default
  `CODEX_SOFT_CAP=24`) + a monotonic mint `seq`; wired into `prepRecycleStale`. Ages out the oldest
  untouched soft records beyond the cap, keeping the freshest as the §8b reusable pool; hard/known/linked/
  bound are sacred. The soft pool — and the DM digest — now stays bounded independent of session count.
- **Prep item-casting** — `pbundleCast` rolls the macguffin via `rollItem`; `prepCastFrontier` mints +
  places it at the frontier location.
- **Verified:** check-manifest OK; `verify-codex` 57 / `verify-prep` 43 (new eviction + item assertions) /
  codex-roll 38 / prep-bundle 47 / session 16 / dm-events 28 — all green.

### ☑ Also this session — Critical-Magnitude engine WIRED (branch `feat/crit-magnitude`)
`CRIT-MAGNITUDE.md`'s two unbuilt pieces are now built (the lens oracle from 2026-06-23 is wired to live
rolls): (a) **`src/engine/crit.js`** `rollCritMagnitude(natural,{magnitude})` — pure roller: magnitude d20
→ band (`critBand`, success + inverted-failure ladders) → distinct lenses (`critDrawLenses`) from
`mythic-success/failure-lenses`, row-1 place lens routes to the Myth suite (rolls `myth-seeds`); atoms only.
(b) **`crit_outcome` event** in `applyEvent` — Mythic → Ledger canon, amplified → outcome. (c) **`dmRollFor`**
detects nat 20/1 → rolls the magnitude die openly and attaches the lens vector to the turn. `verify-crit.mjs`
23/23; check-manifest OK (44 modules). *In-play handshake render unverified here (no live Bridge) — eyeball
it at the next playtest.*

### ▶ Next (the build plan)
With the Codex closed and Crit-Magnitude wired, the open big track is **Advancement / leveling**
(`ADVANCEMENT.md`): `CLASS_PROGRESSION` (L1–20) + the XP curve (decided SRD-exact) exist — remaining is
(2) author the SRD XP thresholds as a compile-ready table → JSON, (3) event-contract XP plumbing (prefer
detected-from-state-delta over DM-declared), (4) the rest-gated level-up beat (reuse the bardo machinery).
Smaller: the `rollVision → fireVision` rename (chipped); a live re-playtest to feel crit-magnitude + the
codex in play.

---

## ⭐ (2026-06-25, late) — Project relocated + path strings swept [Claude Code]

**Genesis moved out of the Obsidian vault** to its own home at **`~/Desktop/Work/projects/Genesis`**
(`bf3818c` → `8bb6a93`); the `Shifting Vale` / `Playtest Sandbox` human-DM vaults are no longer siblings
(they live at `~/Desktop/D&D/Obsidian Files/`). A follow-up pass swept the stale `Obsidian Files/Genesis/`
path strings from the docs (`HANDOFF`/`README`/`DESIGN`) and the **genesis skill** (`SKILL.md` + plugin
`manifest.json`), and logged it all in `CHANGELOG.md`. Verified every referenced path resolves on disk.
Pure docs/config — no code touched, all suites still green. **The CODEX session below is the real build
work; this was housekeeping on top.**

---

## This session (2026-06-25) — CODEX Phases 2–5 built, reviewed, merged to master [Claude Code]

**The whole back half of the Codex shipped this morning** — `feat/codex-phase2` → 4 build commits + 1
review-fix commit → `--no-ff` **merged to `master`** and pushed (`b3eee9a`), branch deleted. The Codex is
the fix for the Saltrest "DM invented the whole cast" failure (see the §"headline finding" block below from
2026-06-24). **The anti-drift loop is now closed end-to-end: the engine rolls a cast, prep stages it as hard
data, the DM connects rather than invents.** Tree clean, **43 modules**, all suites green.

### What landed (newest first; full detail in `CHANGELOG.md` + `docs/CODEX.md`)
- **Phase 2 — the rollers** (`src/engine/codex-roll.js`): `rollNPC()`/`rollPlace()`/`rollItem()`/
  `rollBuildingInterior()` chain the compiled `npc-*`/`place-*`/`plot-item`/`plot-lock`/`building-interior`
  tables into **codexAdd-ready payloads** — `rolled` (raw dice verbatim) + player-safe `fields` + DM-only
  `dm` levers. Items are **pointers** (`source:{type,ref}` §8b). They return atoms, never write `w`.
- **Phase 3 — prep casts the codex** (`prep-bundle.js` `pbundleCast` + `prep.js` `prepCastFrontier`): each
  rumored frontier rolls a soft **location + 1–2 NPCs** (one questgiver); `startPrep` mints them as
  `provenance:"prep", soft:true`, binds the location to the frontier node (`node.codexId`) + places the NPCs
  (`status.at`); `lockOnContact` locks the location to canon on entry. Synthesis now **connects** a
  dice-dealt cast.
- **Phase 4 — the session frame** (`play.js` `startSession`/`endSession` + `render.js`): explicit **Start
  Session** (▶ button on every world card + in-world) → `beginSession` casts the codex → `wakeIntoWorld`
  cinematic → the DM opens the scene **once the cast is hard data**. **End Session** recycles unvisited soft
  prep + returns to the shelf. A "session live" badge.
- **Phase 5 — the missing table-sets:** three net-new **d300 Commitment** tables (198/60/27/12/3), authored
  via 3 parallel agents + compiled (**337 tables, 0 real bugs**): **`building-interior`** (the "gran's house
  had nothing to roll" fix), **`plot-item`** (specific objects, replaces abstract `quest-macguffin`),
  **`plot-lock`** (key/lock complement). Mythic rows rescaled to genuinely cosmic (Adam's review).
- **Pre-merge code review** (8 finder angles → 3 fixes): session-flag ordering, prep-cast id collisions
  (`prepCastId`), and a `status`-merge robustness fix. See `CHANGELOG.md` 2026-06-25.

### ▶ Next (the plan)
1. **Phase 6 — the Codex UI panel** (records grouped by kind + their links as clickable cross-refs,
   knowledge-gated like the other panels) — `docs/CODEX.md` §6. **Needs a browser** (preview is
   sandbox-blocked in the Claude-Code env here — run it locally).
2. **Soft-pool eviction cap** (review follow-up, design call) — the soft codex pool grows unbounded and
   `dmDigest` sends the whole codex each turn. Decide a prune/cap policy. `NEXT-STEPS.md` "Do next".
3. **Re-playtest over the Bridge** + run the script-side **`codexProvenanceReport`** ratio test against the
   ~20% mechanical Saltrest baseline (the codex's job is to flip that). Also **eyeball the Phase 4 shelf
   button + cinematic** in the browser — unverified here (sandbox).
4. *Easy follow-on:* prep **item-casting** in `pbundleCast` (the `rollItem` roller exists; prep doesn't
   auto-call it yet).

### Verifiers (all green this session)
`dev/verify-codex.mjs` 39 (Phase 1) · `verify-codex-roll.mjs` 38 (rollers) · `verify-prep-bundle.mjs` 47
(casting in the bundle) · `verify-prep.mjs` 36 (cast minted/bound/locked + id-collision guard) ·
`verify-session.mjs` 16 (the session frame) · `verify-dm-events.mjs` 21 · `check-manifest.py` OK (43 modules).

---

## Orientation (the 30-second version)
**Genesis is a standalone single-player TTRPG video game** — the player rolls a world into being, an **AI DM narrates**, and worlds persist forever in the browser. Built *on* the Arcana Engine but is **its own product**.

**Where to operate:** everything Genesis lives in **`~/Desktop/Work/projects/Genesis`** (relocated here from the Obsidian vault on 2026-06-25) — `genesis.html` (the game), `Engine/` (clean Genesis-owned Arcana Engine), `Asset Library/` (monsters + NPCs + factions + generators, Genesis-owned), and `Reference/` (the source PDFs + book indexes). **All design docs/specs now live in `docs/`** (reorg 2026-06-21) — see `docs/README.md` for the index; only the root `README.md` + `table-registry.md` stay at the repo root.
**What to ignore:** the `Shifting Vale/` and `Playtest Sandbox/` Arcana Engine copies — the human-DM system. Don't scan/edit them for Genesis work.

## ▶ Running Genesis (CHANGED 2026-06-20 — now modular, needs a server)
`genesis.html` is **no longer a single self-contained file** — it loads `data/*.js` + `src/*.js` modules, which `file://` cannot fetch. **Double-clicking `genesis.html` now shows a broken/empty page.** Run it over localhost:
- **Easiest:** double-click **`~/Desktop/Launchers/Open Genesis.command`** — starts the server (detached) + opens Chrome. Port **5175** (chosen to avoid 5173 Proposal Builder / 5174 Palette Buddy / 8000 Drawing Trainer).
- **Manual:** `cd "$HOME/Desktop/Work/projects/Genesis" && python3 -m http.server 5175 --bind 127.0.0.1` → open `http://127.0.0.1:5175/genesis.html`.
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
- **Commit in logical units** with a clear message; the working tree was clean at handoff (`f9e5601`).
- **Before considering a change done:** run `python3 build/check-manifest.py` (after module edits) and a jsdom headless pass (load the real `genesis.html`, drive the flow). Recompile tables with `python3 "Engine/00. _System/compile-tables.py" --emit` if you touched Engine table markdown.
- **Tracked vs not:** source + docs + `tables.json`/`tables.js` + `Reference/SRD-Data/` are committed. **Ignored:** the scanned rulebook PDFs (large + copyrighted — never push), `Archive/`, `node_modules`, `.DS_Store`. `tables.json`/`tables.js` are committed *but generated* — never hand-edit; recompile.
- **Remote (2026-06-21):** private GitHub repo `origin` = **`tiltandfade-lab/Genesis`** (SSH). `master` tracks `origin/master` — `git push` after each `--no-ff` merge. (`tiltandfade-lab` is Adam's personal account; no `main` branch exists.)

## This session (2026-06-24 — latest) — First live playtest → UX/contract hardening + resource tracking + the CODEX (spec + Phase 1) [Claude Code]

**The first real DM-Bridge playtest happened** (world *Saltrest*, PC *Pendleton Perrybottom*, an Urchin
Bard) and doubled as a hardening pass. Many small merges; **tree clean, 42 modules, all suites green.**
Run the live DM on **Sonnet** next time (latency); the 30s/turn last night was the Claude-Code dev harness
(tools + file mailbox + Opus medium), not representative of the production API path.

### The headline finding → the CODEX
The DM (AI) **invented the entire cast** (Quill, Sabarra, Coll & Mire, the Cinderyard, Tinker's Stair, the
key) and then couldn't keep it straight (an NPC bled in from another character's world). Root cause,
confirmed by reading the code: **Session-Prep rolls the *stage* (environment walks + abstract hooks), not
the *players* — it mints zero NPCs/places/items — and there is no entity store** (NPCs lived as ledger
prose + flat gazetteer rows). Violates the anti-drift north star.
- **`docs/CODEX.md`** specced (+ refinements Adam approved): NPCs/Locations/Items/Factions become
  **relational records in `w.codex`** (Obsidian-wikilink model); the engine rolls the atoms, **the AI only
  assigns meaning + wires links**; a **recontextualization engine** (untouched soft entities are a reusable
  pool — preserve the rolled soul, reassign the role) means no wasted rolls; **touch = lock to canon
  forever** (never recontextualized/duplicated); the codex is the omniscient store, the player sees only a
  **sanitized knowledge-gated projection**. Decision rows in `DESIGN.md` (2026-06-24).
- **☑ CODEX Phase 1 BUILT** — `src/world/codex.js` (`world.codex`): the store + record shape + two-tier
  soft/hard lifecycle + `codexRecontextualize` (refuses on hard) + `codexSoftPool` + all-seeing
  `codexDigest` vs sanitized `codexPlayerView` + core link vocab + `ensureCodex` migration; `codex_*` events
  in `applyEvent`; `dmDigest` serves the codex slice. **`dev/verify-codex.mjs` 39/39.**

### ▶ Next (the plan, in `NEXT-STEPS.md` "Do next")
**☑ CODEX Phase 2 BUILT (2026-06-24)** — `src/engine/codex-roll.js`: `rollNPC()`/`rollPlace()` chain the
already-compiled `npc-*`/`place-*` tables (via `rollTable`) into `codexAdd`-ready payloads (`rolled`
verbatim + player-safe `fields` + DM-only `dm` levers); rollers mint atoms, don't write the world (prep/
the DM emit `codex_add`). `dev/verify-codex-roll.mjs` 27/27; check-manifest OK (43 modules). **Next:
Phase 3 BUILT (2026-06-24)** — prep now **casts the codex**: `assemblePrepBundle.pbundleCast` rolls a soft
location + 1–2 NPCs (one questgiver) per frontier; `startPrep` mints them as `provenance:"prep", soft:true`
records bound to the frontier node (location → `node.codexId`, NPCs placed via `status.at`); `lockOnContact`
locks the location to canon on entry. Summary carries a compact cast; synthesis now *connects* a dice-dealt
cast. **☑ Phase 4 BUILT (2026-06-24)** — the session frame: `startSession(id)`/`endSession()`
(`src/world/play.js`). Start enters the world → `beginSession` (casts the codex) → `wakeIntoWorld`
cinematic → DM opens the scene once the cast is hard data (idempotent on a live session, won't double-cast);
End clears `sessionLive`, writes a closing beat, recycles unvisited soft prep, returns to the shelf. UI: a
**▶ Start session** button on every world card + a session-aware Start/End control in-world + a "session
live" badge. `verify-session.mjs` 16/16; check-manifest OK (43 modules). *(Browser render sandbox-blocked
here — eyeball the shelf button + cinematic first thing at playtest.)* **☑ Phase 5 BUILT (2026-06-24)** —
the two missing table-sets as three net-new **d300 Commitment** tables (198/60/27/12/3, authored via 3
parallel agents, compiled → **337 tables**, 0 real bugs): **`building-interior`** (the "gran's house had
nothing to roll" fix), **`plot-item`** (specific objects, replaces abstract `quest-macguffin`), **`plot-lock`**
(key/lock complement). Mythic rescaled to cosmic (Adam's review). Wired `rollItem` (item-as-pointer §8b +
optional `lock`) + `rollBuildingInterior` in `codex-roll.js`; `verify-codex-roll.mjs` 38/38. **Next: Phase 6
— the Codex UI panel; then re-playtest over the Bridge + the mechanical-vs-invented ratio test**
(`codexProvenanceReport`; baseline Saltrest ≈ 20% mechanical / 80% invented). (Easy follow-on: prep
item-casting in `pbundleCast`.)
**Phase 5** = author the two MISSING table-sets (a building/interior generator; a specific plot-item/key
generator — `quest-macguffin` is only categories today). **Phase 6** = the Codex UI panel.

### Live-play hardening shipped this session (all merged)
- **Waking flow:** prep/loading cinematic → DM narration fades in; killed the raw entry **data-dump**;
  Session-Prep auto-fires on wake.
- **Chat surface:** word-by-word **streaming** with a caret, **read-from-top** then **sticky-bottom** scroll
  (not locked-bottom), **Enter** sends (Shift+Enter newline), compact scene-head, **hidden top breadcrumb
  bar**, `**bold**` rendering, fonts **+30%**.
- **Panels:** **knowledge-gating** (Powers/Gazetteer show only what the character knows — `render.initKnown`),
  toggle-to-collapse, **viewport-fit** (no full-page scroll), **full skill list with live modifiers**
  (`SKILL_ABILITY`).
- **Mechanics:** **consumable-resource tracking** (`src/engine/resources.js` — spell slots/HP/pools,
  engine-owned, rest-restore) + **roll-request persistence** & **in-flight-turn resume** across reloads.
- **DM Bridge:** these all live in the dev harness — see the process gotcha below.

### DM Charter — agency rules locked from playtest feedback (all in `DM-CHARTER.md` §3 + memory)
- **Verbatim player dialogue** — when the player speaks in character, quote it word-for-word; never rewrite.
- **Open handoffs, default OFF for option menus** — present the situation and stop; no "1/2/3" menus
  (Adam: "I'd rather make bad choices than pick your 3 great ones").
- **No tactical coaching** — never suggest the player's spell/skill/approach; answer direct rules questions
  plainly (information, not steering).
- **No NPC bleed** — only voice NPCs in the current world's digest; never carry one across PCs/worlds.

### Process gotcha (memory'd) + queued tasks
- **NEVER run `dev/verify-bridge.py` during a live playtest** — it shares + `/reset`s the `.dm/` mailbox and
  deletes pending turns (it ate a roll mid-session). Use the jsdom harnesses during play.
- **Spawned worktree tasks:** life-event sub-rolls ☑ done+merged; **"of your choice" creation picks**
  (instruments/tools/languages) — chip still open; resource follow-ups (rest-restore polish + a dedicated
  harness) — minor.

---

## This session (2026-06-23, session 3) — Session-Prep system END-TO-END + crit lens oracle + table audit [Claude Code]

**🎲 The AI-DM Session-Prep system is built end-to-end — Genesis is now PLAYTESTABLE over the Bridge.**
The whole arc landed this session: crit lens oracle → table audit → the three walk-rollers → the
synthesis contract → the prep state machine wired into the live world. ~10 `--no-ff` merges; tree clean.

### What got built (newest design first; full detail in `docs/SESSION-PREP.md` + `CHANGELOG.md`)
1. **Crit-Magnitude lens oracle** — `Mythic Success/Failure Lenses` (d12 each, `Session Mechanics/
   Consequences/`); each row a *vector*, AI fills content; the magnitude die also sets a **cascade count**.
   Resolves CRIT-MAGNITUDE §4's "missing middle" — the Myth suite did NOT need reworking.
2. **Table-usage audit** → `docs/TABLE-USAGE-AUDIT.md` (+ `build/gen-table-usage-audit.py`): 89/248 source
   files were Oracle-only — and those orphans turned out to be exactly the Session-Prep payload.
3. **Session-Prep system** — *"the story is in the dice"* (over-roll the cheap rollers → AI synthesis pass
   harvests the throughline latent in them). Generalizes DM-CHARTER §8.4 (soft-until-contact) to a heartbeat.
   - **Walk-rollers** (`src/engine/walk.js`/`dungeon-walk.js`/`wild-walk.js`) — ported from the Obsidian
     Urban v3.1 / Dungeon v4.2 generators (urban 16 topologies; dungeon 12 + depth-loot + Myth-affinity
     boss) + wilderness authored fresh (leg journey). Each → segments=nodes, transitions=edges.
   - **Synthesis contract** (`docs/SYNTHESIS-CONTRACT.md`) — `prep-bundle.js`/`quest-hook.js` assemble the
     multi-environment input; two staged prompts (`Engine/00. _System/AI Prompts/synthesis-{harvest,reskin}.md`)
     do Stage 1 harvest → Stage 2 roll-keyed overlay. **Cardinal rule: annotate the rolls, never rewrite.**
   - **Prep state** (`src/world/prep.js`) — `beginSession()` fires prep; each environment becomes a **soft
     "rumored frontier"** map node (dashed; soft edge = the quest hook). `⎘ Prep handoff` button exports the
     bundle; `prep_applied` enriches frontiers from synthesis; `prep_contact`/`lockOnContact` lock soft→hard
     on entry. Recycle unvisited frontiers; prep-debt.
4. **Compiler change (foundational):** `compile-tables.py` emits `row[5]` structured cells so multi-column
   prep tables keep their columns (`tables.json` was lossy). `rollTable().cells` added. Recompiled → 334 tables.
- **Verified headless:** `dev/verify-walk.mjs` (2667), `verify-prep-bundle.mjs` (32), `verify-prep.mjs` (22).
  `check-manifest` OK. **Browser render of soft frontiers UNVERIFIED** (preview server sandbox-blocked here)
  — eyeball it first thing at playtest.

### ▶ Next: THE PLAYTEST (Adam's call)
**Run a real prepped session over the DM Bridge** (`python3 dev/dm-bridge.py` + `/loop` per `docs/DM-BRIDGE.md`):
New session → frontiers stage on the map → **⎘ Prep handoff** → run `synthesis-harvest` then per-env
`synthesis-reskin` → apply via a `prep_applied` event → play; heading to a frontier fires `prep_contact`
and locks it. Watch for: (a) do soft frontiers render? (b) is the Stage-1 throughline honest on summaries
alone (the known tune item)? (c) do the reskins hold? Then the refinements: (#6) fuller orchestrator
(plausibility-from-frontier; NPC/Place depth rollers), and the `quest-*`/NPC-hook table improvement pass.

---

## This session (2026-06-23, session 2) — T2 Myth/Urban tables + Crit-Magnitude spec [Claude Code]

**Table-improvement pass T2 done — the 3-tier pass is now COMPLETE** (T1 Place Gen · T3 NPC atoms ·
T2 Myth/Urban). Committed on branch `feat/table-pass-t2-myth-urban`, `--no-ff` merged to `master`,
pushed to `origin`. Recompiled to **332 tables**, 0 real bugs.

### Three tables — content-only, **deliberately NOT wired** (rollable via the Oracle tab)
Authored via the 5-band-samples-first protocol (Adam reviewed voice before the full 100-row authoring);
all d100 Commitment, 66/20/9/4/1, every row unique.
- **`myth-costs`** d12→d100 (what a legend now demands / attracts / inflicts) and
  **`myth-becomes-geography`** d10→d100 (how a myth scars the land). Originals → `Mythic Events/zz_Archive/`.
- **`urban-pressure`** — NEW d100 oracle in `Session Mechanics/Pressure/`: single-roll **citywide
  ambient pressure** for slow urban play (what the freed `urban-encounters` slot was reserved for —
  built under a distinct `urban-pressure` id). Distinct from the `Urban Encounter v2.5` node generator.

### Crit-Magnitude system — SPECCED → `docs/CRIT-MAGNITUDE.md`
Adam's design call captured (formalizes the one-line `SPICE-CURVE` §3 stub): **nat 20 / nat 1 → a second
d20** (the *magnitude die*) scaling Standard → Amplified → **Mythic** (= Local → Regional →
Planar/Cosmic; lands on the Constitution's Escalation Curve rarity). **20/20** = permanent boon written
to the Ledger as canon (Adam's Light-of-Lathander shrine); **1/1** = mirror failure (humor by default,
dark + permanent at high stakes — the hell-portal/cult twin). Cross-reffed into `DESIGN.md` (decision
rows), `DM-CHARTER.md` §6, `SPICE-CURVE.md` §3.
- **The seam (important for the next task):** the crit system is the **generic engine** (any d20 action);
  the **Myth suite is one *situational* payload** (a place/deed becoming legend), NOT the universal
  mythic answer. The missing middle is a generic context-tagged mythic-outcome oracle.

### ▶ Next clean-session task (Adam's call)
Build the **generic context-tagged mythic-outcome oracle** — the middle layer between the crit engine and
its payloads (combat / social / exploration / place-deed contexts). It's what lets a 20/20 or 1/1 actually
reach for the Myth suite. Specced in `CRIT-MAGNITUDE.md` §4; everything stays **unwired** until then.
Also open from this session's review: two band-placement judgment calls (`myth-costs` 95, `myth-becomes-
geography` 89 — left as Strange, cheap to bump to Volatile) and wiring all three new tables into live play.

---

## Previous session (2026-06-23, session 1) — NPC atoms → d300 + tavern rename + Place Gen fixes [Claude Code]

Table-improvement pass continued: **Tier 3 (NPC atoms) built, Tier 1 (Place Gen) reviewed + fixed**,
plus a scope-correcting rename. All committed on branch `feat/table-pass-npc-atoms`, `--no-ff` merged to
`master`, pushed to `origin` (`a933f3e..b21f2a0`). Recompiled to **331 tables**; `check-manifest` OK.

### NPC atoms (T3) — four d300 tables via workflow
The DMG/2e **`NPC Hook Megatable`** (Immediate Motivation 50 / Side-Quest d8 / Bonds d10 / Flaws d12 —
flat boilerplate) is **retired** (→ `zz_Archive/`) and replaced with four **d300 Commitment** tables,
spice-graded 198/60/27/12/3, voice-calibrated to the 5-band ladder (Adam: *"spice curve on blast"* —
Mythic genuinely breaks reality):
- **`npc-immediate-motivation`** — what an NPC is doing the moment the party first notices them.
- **`npc-bonds`** — what they protect / strive for (the lever to move them).
- **`npc-flaws-secrets`** — what they hide / their fatal weakness.
- **`npc-job-board`** — a job offered, in the NPC's own voice.
- **Build method (reusable):** Workflow `npc-atoms-flesh-out` (36 agents) — overgenerate ~45% per
  band **with disjoint thematic lanes** so parallel agents diverge, then **dedup + trim to exact band
  counts in JS code** (not an agent). Generators ran on **Sonnet/low** (bulk prose w/ strong anchors =
  low decision-density → cheap + fast). Result returned as structured data; this Claude wrote the .md
  files. Hit exactly 300/table on first run.

### Cleanup folded into the same change (two latent bugs caught)
- **`npc-bond` / `npc-flaws` were first-person PLAYER tables** mislabeled with an `npc-` prefix (header
  literally read "Player Flaws", entries "I assume the worst…") → renamed **`pc-bond` / `pc-flaws`**
  (domain `Character Genesis / PC Traits`). Removes the `npc-bond` vs `npc-bonds` one-letter footgun.
- **Quick NPC Generator 2.0 had been feeding NPCs the first-person PC flaw table** (latent bug) →
  repointed to `npc-flaws-secrets` + `npc-bonds`. `NPC Honesty` prose cross-links repointed too.
- **`npc-secret`** (thin, 100) retired → `zz_Archive/` (superseded by `npc-flaws-secrets`).

### Tavern rename — `urban-encounters` → `tavern-encounters`
The d12+d8 `urban-encounters` (19 half-written, bar-overfit rows) was **always a tavern table**, not
the citywide tool (that's the `Urban Encounter v2.5` node generator). Renamed id → **`tavern-encounters`**
(file `Tavern Encounters.md`). **The freed `urban-encounters` slot is reserved** for a future citywide
random-PRESSURE oracle — a single-roll table for slow urban play when the party isn't closing on
anything. Not built yet — queued.

### Place Gen fixes (T1 review follow-up)
- **Place Traits row 20** was a near-dupe of row 67 (both "town atop an older settlement / furnished
  cellar") → rebuilt to a distinct **lighthouse/salvage** Grounded trait.
- **Place-Secret rows 1–20** were abstract category stubs ("Misjudged a Threat") → **concretized** to
  match the specific rows 21+. Verdict on the suite: the trait→calamity causal coupling is the bar.

### Aside — model-selection note (Adam's question)
For high-volume table *prose generation*, **Opus medium (or +Fast mode)** is the sweet spot; **reasoning
tier should track decision-density, not output volume** — bulk authoring with clear anchors runs fine on
a lower tier (this build's generators were Sonnet/low). Reserve high/max for design/debug.

---

## This session (2026-06-22) — Place Gen table pass + Hometown bardo wiring [Claude Code]

### Place Generation table pass (9 tables rebuilt via workflow)
All Place Generation tables promoted from range-batched / thin rows to full spice-graded d100s
(66/20/9/4/1 distribution, one row per number, Commitment ceiling). Workflow pattern is now
standard for multi-table parallel work. Branch `feat/table-pass-place-gen`.
- **Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status** — all full d100, Band column retained, pre-spice originals
  archived in `zz_Archive/`.
- **Place Traits** — d20 (no Band, 2-col) → d100 (4-col: `| d100 | Band | Trait | Calamity |`).
  Calamity is always causally linked to the Trait. `table_class: Fork → Commitment`.
- **Place-Secret** — d20 → **d200** (the engine's first d200; `amax=200` in frontmatter,
  compile script auto-derives dice and distribution). ~32% monster tie-ins: dragons, aboleths,
  fae, vampires, liches, hags, mind flayers, beholders. 4-col `| d200 | Band | Hidden Mistake | Description |`.
- **Place Ruler Status row 93 (Strange):** dragon-on-a-technicality entry added per Adam's request.
- `tables.json` / `tables.js` recompiled — 332 clean tables, 0 real bugs.
- **⭐ Adam wants to review all Place Gen tables next session** before moving to T2/T3.

### Hometown Bardo Wiring
Three Track-B table rolls (place-master-setting → place-history → place-mythology) slot into the
bardo after Life and before the 9 world-genesis beats. First Track-B integration into the bardo
flow (previously all bardo beats used inline Track-A `T` data). Branch `feat/hometown-bardo`.
- **`data/creation-flow.js`** — 3 GUIDE entries added (`ht_setting`, `ht_history`, `ht_myth`).
- **`src/creator/bardo.js`** — `buildBardoSeq()` + `bardoSpine()` extended; `bardoRollHometown` /
  `bardoHometownReroll` / `htMarkdown` added; `bardoLog()` shows Hometown / Founded / Town Myth;
  `renderBardo()` handles `{t:"hometown"}` with die + fragment + reroll (shared reroll budget).
- **`src/world/play.js`** — `bindWorld()` seeds `world.seed.hometown` + writes a canon Ledger entry
  (markdown bold stripped for storage).
- **`manifest.json`** — new owns + `rollTable` call-time dep. `check-manifest` clean (34 modules).

---

## This session (2026-06-21 — latest) — Death & Rebirth loop (all 7 steps) + icon assets [Claude Code]
- **The whole Death & Rebirth loop is built** (spec: `DEATH-AND-REBIRTH.md`; design rows in `DESIGN.md`). On death: the world drifts weeks forward (**bardo gap**, 0–49d bell) + the faction web turns; **14 visions** dream the world's direction over the dead PC's **Saga** (their 7 most significant entities), surfaced to the player as Fragments; the **corpse** lingers + decays by context (recover its loot if you reach it in time); a **new soul** is born — possibly **sworn to a rival** of the dead PC's allies (class-weighted faction proximity) — in a **distant region of one shared plane**.
  - New modules: `src/world/saga.js` (`computeSaga`/`refreshSaga`), `src/world/rebirth.js` (`bardoGap`/`bardoVisions`/`runBardo` + corpse: `corpseStatus`/`corpsesAt`/`claimCorpse`). Reworked `src/world/fate.js` (death → bardo passage → successor; d20 spawn-back **retired**; `#fateModal`→`#bardoModal`). Plane in `world.state` (`regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion`) + `spawnSuccessorOnPlane`. Proximity in `world-gen.js` (`rollFactionProximity`/`factionKind`) + `data/srd-creator.js` (`METHOD_KIND`/`CLASS_FACTION_AFFINITY`).
  - **XP curve decided: SRD 5.2.1 exactly** (slow climb intended; death expected). **Plane migration is ADDITIVE** (supersedes the spec's bank-and-restart — nothing reset; `U.plane={version:3}`, v2 storage key kept).
  - **Draft content to refine later:** `VISION_OUTCOMES`, the corpse `CORPSE_CONTEXTS`, the faction affinity — all inline drafts, authorable into proper spice-graded tables.
  - **Verified:** `check-manifest` clean (34 modules); `dev/verify-saga.mjs` (45) · `verify-proximity.mjs` (12) · `verify-rebirth-flow.mjs` (19) · `verify-plane.mjs` (14); `dm-events` 21 (no regression). Browser preview couldn't run in this env (sandbox blocks http.server + :5175 held) — verified via full-app jsdom.
- **Ivalice icon assets isolated + wired.** Adam re-exported the asset sheets on **flat magenta**; `ui-sketches/ivalice-style/assets-iso/extract.py` (magenta chroma-key → scipy component isolation, 496 cutouts) + `slice-grid.py` (exact grid: **big-icons → 30 named**, micro-icons → 108) produce transparent PNGs (`extracted/` is git-ignored, regenerable). The 10 used icons live in `assets/icons/`; the in-world **rail + HP/AC badges now render real icons** (`gico()` in `render.js`, glyph fallback via `onerror`).
- **Deferred polish:** region-map SVG + coarse region-to-region travel; author the draft vision/affinity/corpse tables; wire more icons (panels/buttons/decor); the earlier reskin "still needs work" items.

## This session (2026-06-21 — earlier) — DM Bridge + chat-first UI + Ivalice reskin [Claude Code]
- **DM Bridge v1 (`DM-BRIDGE.md`) — the AI-DM loop is live.** `dev/dm-bridge.py` (stdlib mailbox + static server; replaces `-m http.server`). `src/world/dm.js` (`world.dm`): `dmDigest` (JSON twin of `handToDM`), `sendTurn`/`pollResponse`/`applyResponse`, and **`applyEvent(w,e)` — the EVENT-CONTRACT runtime** (a `switch` dispatching typed events to the real mutators; the DM never writes `U`). **This `applyEvent` IS the first piece of advancement's event plumbing — build on it.** Tests: `dev/verify-bridge.py` (29, transport+contract), `dev/verify-dm-events.mjs` (21, full-app jsdom: applyEvent + render). **Running a session:** `python3 dev/dm-bridge.py`, open the URL; a DM watches `.dm/` via `/loop` on **Sonnet** (or Claude hand-answers `.dm/turn-*.json`→`response-*.json`). App waits 5 min for a reply. NEVER `rm -rf .dm` while the bridge runs (it's hardened to re-`makedirs`, but still).
- **Chat-first World view (`NEW-GAME-FLOW §9`) — built.** The World view is the DM conversation centered, with a 6-icon left rail (Story/Character/Map/Ledger/Gazetteer/Powers) whose panels slide in beside the chat (Disco-Elysium two-pane); panels reveal per the Curve of Revelation. Waking cinematic: bardo fades to black → the DM's opening (`wakeIntoWorld` / `autoOpenScene`).
- **Live-playtest fixes:** full spell text in a viewport-clamped tooltip; skill/equipment/spell/choice blocks **gridded**; **one-click "Begin"** (cut the redundant threshold/soul gates); running "So far" list → right column + **life-event rolls itemized**; "This Is Your Life" **inline dice now rolled + gold banked** (`cgMakeEvent`/`cgResolveInlineDice`); DM-bridge poll timeout + resilient mailbox + hidden auto-opening turn.
- **Ivalice UI reskin — the whole app is now light parchment-on-stone** (FFT: Ivalice Chronicles look; from Adam's ChatGPT sketches + texture atlas in `ui-sketches/ivalice-style/`). Cinzel + EB Garamond; fixed top breadcrumb; parchment pages with real paper grain (`assets/textures/`); gold double-borders + steel-blue accent. All five concept surfaces reskinned (start / soul-forging / play / character / world-die) + shelf + map + ledger. **Still rough (Adam: "still needs work"):** corner filigree is approximated (no SVG art); fonts load online (bundle woff2 for offline); legacy manual-sheet + Oracle tabs got only the token-flip.
- **Git workflow live:** branch-per-task → verify → `--no-ff` merge → push to the **private GitHub remote** `origin` = `tiltandfade-lab/Genesis`. `master` is the line (no `main`). Everything above is merged + pushed.

## This session (2026-06-21) — `CLASS_PROGRESSION` (levels 1–20) built [first Claude Code session]
- **Built the advancement track's load-bearing step 1** (`ADVANCEMENT.md`): `data/class-progression.js` (generated) → `CLASS_PROGRESSION`, **12 classes × levels 1–20, 254 feature entries, ~144 KB**. Per level: `pb`, full-SRD-text `features[]`, caster `cantrips`/`prepared`/`slots` (full/half/pact) + Wizard `spellbook`, and class resource scalers (rage, sneak attack, sorcery points, etc.). Until now only L1 existed (`data/srd-creator.js`).
- **Generator `build/gen-class-progression.py` — parse-then-validate.** The SRD's per-level numeric grids *survived* OCR (space-separated rows, em-dash = empty), so it parses the real `classes.md` grids and **asserts parsed spell-slots against authored canonical full/half/pact matrices** (OCR corruption fails the build). Feature names + prose parse from the clean `### Level N:` headings. Ranger's grid was too OCR-scrambled → authored from the Paladin-validated half-caster canon. **Recurring features handled as canonical constants, not parsed** (the summary table is too OCR-corrupted — Fighter lost its level column): ASI 4/8/12/16 (+Fighter 6/14), the few class repeats (Bard/Rogue Expertise, Sorcerer Metamagic, Warlock higher Mystic Arcana), and Wizard's source-absent subclass levels (6/10/14).
- **Registered** `data.class-progression` (manifest + `<script>` + `check-manifest` LAYER). `check-manifest` clean — **30 modules, 215 owned symbols** (only the 6 known layer warns). **Verified 797/797 headless jsdom** (real `genesis.html`), incl. **L1 reconciliation with `srd-creator.js` `CLASS_CASTING`** (which surfaced + correctly models Wizard's spellbook-vs-prepared split). Committed `f9e5601`.
- **jsdom gotcha (memory'd):** classic-script top-level `const` are NOT on `window` (only `var`/functions) — read const globals in a harness via `dom.window.eval("NAME")`. See `project-genesis-class-progression` memory.
- **Out of scope (next):** subclass feature *content* (base classes only), the **XP threshold curve** (its own decision per `ADVANCEMENT.md`, to make before wiring leveling), and any leveling UI.

## This session (2026-06-21) — Git repo + `CLAUDE.md` (Claude Code readiness)
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
**⭐ Table-improvement pass — remaining work.** T1 (Place Gen) ☑ reviewed + fixed (2026-06-23). T3 (the
core NPC atoms) ☑ rebuilt to d300 (2026-06-23). **Still open:**
- **T2 — Myth content:** `Myth Costs`, `Myth Becomes Geography` (thin) → spice-graded rebuild, same
  workflow/5-band protocol.
- **Citywide urban-pressure table** — build the single-roll random-pressure oracle for the now-freed
  `urban-encounters` slot (distinct from the `Urban Encounter v2.5` node generator and from the renamed
  `tavern-encounters`).
- **Optional follow-on:** wire the new situational tables (`npc-immediate-motivation`, `npc-job-board`)
  into encounter-time flow — they're not in the static Quick NPC Generator (which now pulls role / visual
  / hook / talents / **flaws-secrets** / mannerisms / **bonds** / useful-knowledge / bonus-secret / ability).
- **Other NPC atoms** still thin if you want to keep going: Demeanor, Mood, Under Pressure, Talents, etc.

**DM Charter (v1 specced 2026-06-22):** write the DM's operating contract — ground rules + secret-information handling + **the slow drip of reveals** (Adam: *"the slow drip is everything in D&D"*). The DM-side rules are scattered today (Fragment veil, hidden truth layer, three-options, over-reveal discipline, threat-signaling); consolidate into a `DM-CHARTER.md` `system-spec` used by both the DM Bridge and the shipped DM. Full scope in `NEXT-STEPS.md` "Do next".

**The Death & Rebirth loop is COMPLETE** (all 7 steps — see latest-session block). The natural next moves: (1) **author the draft content** the loop ships with — the `VISION_OUTCOMES`, `CORPSE_CONTEXTS`, and faction-affinity drafts → proper spice-graded tables (Adam's domain); (2) **UI polish** — a region-map SVG + coarse region-to-region travel, and wiring more of the new Ivalice icons (panels/buttons/decor) beyond the rail + HP/AC; (3) **lane A — Advancement** (below) is still the big unbuilt mechanic and the XP curve is now decided (SRD-exact).

**(A) Advancement — the meat & potatoes.** Specs locked (`EVENT-CONTRACT.md` / `ADVANCEMENT.md` / `DIFFICULTY.md` / `COMBAT.md`). Step 1 (`CLASS_PROGRESSION`, levels 1–20) ☑ done. **The `applyEvent(w,e)` runtime in `src/world/dm.js` is now built — that's the event-contract spine; advancement plugs straight into it.** Do next:
  1. ☑ **XP threshold curve DECIDED — SRD 5.2.1 exactly** (no compression; slow climb intended given death-expected play). Remaining: author the SRD thresholds as a compile-ready markdown table → JSON.
  2. **Event-contract plumbing** — extend `applyEvent` so the relevant types (`front_closed` / `clock_fired` / `encounter_resolved` / `discovery` …) compute XP into a script-owned ledger; prefer *detected-from-state-delta* over declared.
  3. **Rest-gated level-up beat** — reuse the creator bardo machinery (`cgSheetExtras` + step renderers) to re-walk new spells / ASI / subclass against `CLASS_PROGRESSION` when a threshold is crossed on a rest.
  Combat award-values wait for the Fable engine; everything else is buildable now.

**Queued from the live playtest (smaller, high-value — see the `project-genesis-playtest-open-items` memory):**
- **Show the "This Is Your Life" backstory in the Character panel** — origins + life events; currently seeded to the world (`seedFromLife`) but not shown on the sheet.
- **Expand every range table to unique rows** (EXCEPT the CG life tables) for replay variety — preserve the Spice Curve bands + `FRAG` alignment, archive originals, recompile `tables.json`. Best as a workflow that drafts band-by-band.
- **Bench created worlds + PCs** — a reusable pool that *may* surface in future games (like Wandering Souls, but for worlds too).

**UI polish backlog (the reskin "still needs work"):** real SVG corner filigree; bundle the woff2 fonts for true offline; place the compass-rose motif (topbar/watermark); bespoke-reskin the legacy manual sheet + Oracle tabs; **DM over-reveal discipline** (don't surface DM-only lore in opening choices); text animations on DM narration.

**Other open threads (not blocking):** the broader **Fragment batch** (fill compiled `tables.json` fragment-slots); migrate bardo/world rituals onto the **compiled** tables (today inline `T`/`SS`/`EB`/`FRAG`); change-over-time layer (faction clocks/drift/NPC life-events off the live ledger); Wilderness Encounter Generator inline port.

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
