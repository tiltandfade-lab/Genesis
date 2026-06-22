# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

---

## 2026-06-21 (latest) — Ivalice UI reskin — parchment-on-stone, light & luxurious

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
