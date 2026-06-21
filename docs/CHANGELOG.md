# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

---

## 2026-06-21 (latest) — Version control: git repo + `CLAUDE.md` (Claude Code readiness)

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
