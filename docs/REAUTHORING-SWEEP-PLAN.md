---
type: build-plan
status: ready-for-execution
created: 2026-06-28
supersedes-framing: TABLE-REAUTHORING-PREP.md §3 (the flat 38-item worklist)
related:
  - "[[TABLE-REAUTHORING-PREP]]"
  - "[[GENERICIZATION-SCAN]]"
  - "[[SPICE-CURVE]]"
  - "[[CODEX]]"
  - "[[SOCIAL]]"
  - "[[NEXT-STEPS]]"
---

# Genesis — Re-Authoring Sweep: Executable Build Plan

*Synthesis of a 5-angle workflow scan (recontext-leverage · reference-mining · creature-reskin+IP ·
worklist-validation · non-creature-IP) over the table corpus. This doc is the **executable** companion
to `TABLE-REAUTHORING-PREP.md`: the prep doc holds the per-table flavor brief; THIS doc restructures the
work into ordered, individually-runnable actions split into two execution lanes.*

**The thesis (validated):** recontextualization + consolidation **roughly halves** the hand-authoring
sweep before a word of prose is written. The old "38-item afternoon of flavor-writing" is really **five
kinds of work**, only one of which is authoring.

| Kind of work | ~Items | Prose needed | Lane |
|---|---|---|---|
| Merge / retire (duplicate or Oracle-only redundant) | ~9 | ~zero | B (destructive) |
| Structural die-collapse (fake-large copy-paste tables) | 2 | zero | B |
| Mechanical band-relabel (already rich, ungraded) | 3 | zero | B |
| Recontextualization (lens / compose from a rich donor) | 3 | small lens | A (build) + B (wire) |
| Irreducible hand-authoring (no donor exists) | ~12–15 | yes — the real sweep | B/C |

Plus two clusters that **leave the flavor sweep entirely**: the creature IP cluster (a scripted
token-swap = Track B) and the NPC/monster-behavior cluster (derivable from SRD mechanics already on disk
= Track A2).

---

## 0. How to use this doc — TWO LANES

**LANE A — AUTONOMOUS-SAFE (overnight-runnable, unattended).** Purely *additive*: creates NEW engine
modules, NEW reference/lens tables, NEW content tables, and NEW verify harnesses. It never deletes,
renames, merges, or rewrites an existing Adam-authored table. Every step ends in a **verification gate**
(`compile-tables.py --emit` + `check-manifest.py` + the named `verify-*.mjs`); **if a step's gate fails,
the chain STOPS** and reports — it does not push past a red gate. This is the package that can run while
Adam sleeps.

**LANE B — PROPOSE-AND-WAIT (Adam approves each move).** Everything *destructive* or *voice-bearing*:
merges, retires, renames, die-collapses, band-relabels of existing tables, the creature token-swap, and
all hand-authoring of existing tables. Per Adam's call (2026-06-28): **propose each move with exact
before/after, wait for OK.** Archive-first on every delete (`zz_Archive/` sibling, the Place-History
precedent). Nothing here runs unattended.

> **Why the split lands this way:** "coding operations" (engine + new tables) are reversible, gated, and
> not Adam's authored prose — safe to automate. The consolidation deletes/edits Adam's hand-authored
> tables, and the residue is voice-bearing flavor — both need a human in the loop.

**Stop-anywhere.** Within each lane, steps are ordered highest-leverage first; stopping at any point
leaves a coherent, compiled state.

---

## LANE A — AUTONOMOUS-SAFE (build the machinery + new content)

> Run order is A1 → A2 → A3-new. Each step is independent and gate-checked; a failure stops the chain.
> None of these touch an existing Adam-authored table.

### A1 — Three reusable recontext primitives (engine code)

**A1.1 · Lens-table operator** — *generalize the proven crit pattern into a named primitive.* (M)
- `src/engine/crit.js` already has `critDrawLenses()`: draw N **distinct** rows from a small
  `vector + "DM fills it as…"` table, reroll dups, hand the vectors to the AI to fill against live
  context. Promote it to a general `drawLenses(tableId, count, ctx)` (new `src/engine/lenses.js`, or
  extend crit.js) and teach the compiler a `table_class: lens` so a table can declare itself a
  vector-list rather than a concrete d100.
- **Consumers (wired in Lane B):** Quest Complication (#7), NPC Under Pressure (#17), Quest Urgency
  (#19), Monster Behavior-if-Hunted (#22).
- **Anti-drift guard (encode it):** `drawLenses` is **only** legal on `voice_critical:false` tables —
  it moves concretization to the AI, so it must NEVER serve a Fragment feeder. Add an assertion.
- **Gate:** new `dev/verify-lenses.mjs` (draw-N-distinct, dedup, ctx passthrough, the voice_critical
  refusal) + `check-manifest.py`. **Autonomous: YES.**

**A1.2 · Composition draw** — *thin category table draws concrete content from a rich donor.* (M)
- `src/engine/codex-roll.js` already chains tables (`rollNPC`/`rollPlace`). Expose a generic
  `compose(thinTableId, donorTableId, {filter})` that resolves a thin table's content by drawing a row
  from a RICH donor, optionally filtered by the thin table's category as a constraint.
- **Consumers (wired in Lane B):** Quest Macguffin (#9) ← Plot Item d300; Quest Destination (#8) ←
  Place History d100 (+ optional Place-Secret d200).
- **Gate:** new `dev/verify-compose.mjs` (donor draw, filter, fallback when donor empty) +
  `check-manifest.py`. **Autonomous: YES.**

**A1.3 · Merge/dedup helper script** — *authoring-time, not runtime.* (S)
- A `build/find-dup-rows.py` that, given a thin table + a candidate rich sibling, reports row-text
  similarity so the Lane-B merge proposals rest on real overlap, not assertion. **Read-only** — it
  emits a report, it does not edit. (The validation agent flagged it didn't read every merge-target
  d100 in full; this closes that gap before any deletion.)
- **Gate:** runs clean on the NPC cluster; produces a similarity report committed to scratch. **Autonomous: YES** (read-only).

### A2 — Four SRD-mined lenses (IP-clean; derive from `Reference/SRD-Data/`, already on disk)

> All four POINT at the CC-licensed SRD JSON for mechanics and author only ORIGINAL Genesis-voice
> sensory prose. No PDF needed; no scrub needed. Each is a NEW reference/lens table + a prep-time hook.

**A2.1 · Condition Lens** (S) — new `Engine/03. _Tables/03. Session Mechanics/Scene & Situation/Condition Tell.md`:
the 14 SRD condition NAMES (names are mechanics) → 3–5 ORIGINAL sensory fragments each ("Frightened →
won't cross the doorway; keeps a wall at their back; voice climbs half an octave"). Cite
`conditions.json` as the mechanical source (the Walk-On Quick Stats citation pattern).
**Retires/cheapens:** NPC Fear (#10), NPC Under Pressure (#17), part of #35. **Gate:** compile + manifest. **Autonomous: YES.**

**A2.2 · Hazard-Effect Lens** (S) — new reference keyed by hazard TYPE → the SRD condition it imposes +
the standard save, anchored to the SRD glossary numbers (Burning 1d4/turn, Falling 1d6/10ft + Prone,
Suffocation→Exhaustion). The **third leg** beside the already-built Hazard-Severity (damage) + DC-Ladder
(DC) scaffolds — the *condition rider* they lack. **Cheapens:** In-Building Complications (#25), Camp
Cooking (#24), Wilderness/Urban Hazard rider columns. **Gate:** compile + manifest. **Autonomous: YES.**

**A2.3 · Monster Trait→Behavior derivation** (M) — new `Trait → Behavior Cue` reference: ~12 common SRD
trait/sense names (Pack Tactics, Darkvision, Blindsight, Keen Smell, Burrow, Regeneration, Pounce,
Ambusher, Sunlight Sensitivity, …) → an ORIGINAL one-line tactical/sensory tell. At prep the engine
reads the chosen monster's `traits[]` and emits matching cues, so a wolf and an eye-tyrant stop sharing
a generic behavior menu. **Demotes:** Monster Behavior-if-Hunted (#22) + Monster Motivation (#14) to
thin walk-on fallbacks. **Gate:** new `dev/verify-trait-behavior.mjs` (reads a sample monster file,
emits cues) + manifest. **Autonomous: YES** (monster files are Genesis's own SRD imports, CC-clean).

**A2.4 · Magic-Item Lens** (S) — a one-line "reskin this `magic-items.json` item to the world's motif"
hook reusing the existing `synthesis-reskin.md` pattern; engine picks an item by rarity band, the DM
re-names/re-describes it keeping the rolled mechanic. **Cheapens** Dungeon Loot wondrous flavor; supplies
IP-clean substitutes for the Outlandish jokes. Never surface the raw SRD name as final fiction.
**Gate:** compile + manifest. **Autonomous: YES.**

### A3-new — New content tables (authored fresh; no existing table touched)

**A3n.1 · Creature Genericization Map** (S, DATA-ONLY) — new
`Engine/03. _Tables/03. Session Mechanics/Monsters/Creature Genericization Map.md`: the canonical
`ip_term · generic_name · card_id · presents_as` lookup that Track B's scrub and the reskin-cards both
read. **Authoring this FILE is additive and safe; APPLYING it (the token-swap + stat-file renames) is
Lane B and waits for Adam's approval of the names.** **Gate:** compile (it's a reference) + manifest. **Autonomous: YES** (creating the map; not applying it).

**A3n.2 · Anachronism-Intrusion Hooks** (S) — new `Anachronism Intrusion.md` (d12/d20 **Fork**,
promotable to Commitment for the Mythic "the world is a salvage-yard for a dead future" row). Each row =
a concrete sensory reason an artifact-from-elsewhere is in the world ("a vessel from elsewhere crashed
into the world"; "a wizard's failed summoning that pulled junk instead of a servant"). Grounds the
Outlandish loot tier; referenced from the Outlandish header note; optionally surfaced in
`synthesis-reskin.md`. **Gate:** compile + manifest. **Autonomous: YES.**

**A3n.3 · Reskin cards, CR 4–13** (M) — extend `Walk-On Quick Stats.md` UP the CR ladder: one IP-clean
benchmark body per archetype + a `PRESENTS AS` list (one card → many fictions). Sourced verbatim from
the existing `Asset Library/Monsters & Enemies/*.md` numbers (RAW-stable: reskin mechanics, don't
rewrite). This is the reskin-mechanism half of Track B; **authoring the cards is additive**, the rename
of the source stat files is Lane B. **Gate:** compile + manifest. **Autonomous: YES** (authoring cards).

> **Lane A overnight package summary:** A1 (3 primitives) + A2 (4 lenses) + A3-new (3 tables) =
> the entire recontext machinery + new content, all gate-checked, all reversible. After Lane A runs
> clean, the morning Lane-B session is consolidation + authoring only — every tool it needs already exists.

---

## LANE B — PROPOSE-AND-WAIT (destructive + voice-bearing)

> For each item: Claude proposes exact before/after, **waits for OK**, archives the original to
> `zz_Archive/`, edits, recompiles, runs the gate. Ordered highest-leverage first.

### B1 — Consolidation (the worklist-shrinking; uses A1.3's similarity report)

| # | Move | Touches | Cuts | Note |
|---|---|---|---|---|
| B1.1 | **MERGE** NPC mood/temperament/demeanor/pressure cluster → Demeanor + Mannerisms | retire #11, #12, #17, #35; edit Demeanor + Mannerisms | 4 items → 0 authoring | Lift the few Strange rows (e.g. "Unsettling", "talks to absent people", "doesn't blink at the strange") into the d100 tails; repoint `codex-roll.js` (one table-id change). **Confirm overlap via A1.3 report before deleting.** |
| B1.2 | **MERGE** Resource Control (#16) → Leverage (#13) | retire #16; rewrite #13 in place | 1 item + fixes a wired table | Use #16's tangible nouns as the concretization fuel for #13's abstract-register problem. One edit solves both. |
| B1.3 | **MERGE** Meal Viability (#30) + Cuisine Effects (#37) → one banded food table | retire both, author merged | 1 item | Viability axis + effect axis; replace the "DM discretion" stubs in the merged result. |
| B1.4 | **RETIRE** Dungeon Secret Type (#26) | delete; Secret Tier is a strict superset | 1 item | Both Oracle-only; zero authoring. |
| B1.5 | **RETIRE** Urban Scene (#6) | delete; fold unique beats into Urban Sensory (#28) | 1 item | Oracle-only; redundant with wired Urban Sensory + Urban Segment Scene suite. |
| B1.6 | **COLLAPSE** Urban Lighting d50 → weighted d12 (#1) | rewrite structure | turns an "authoring" item into a de-dup + a small write | 50 rows are ~9 distinct strings copy-pasted; write a REAL per-band variation. voice_critical → the write half is genuine. |
| B1.7 | **COLLAPSE** Travel Biome fake-d100 → weighted d12 (#23) | rewrite structure | de-dup | ~11 biomes repeated 5–20×. **NOT a valued mega-table** (those have distinct rows); keep the table, shrink the die. |
| B1.8 | **RELABEL-ONLY** Art Condition (#32), Art Medium (#33), Faction-Basic (#21) | edit band column + (Faction) +2 frontmatter fields | removes 3 from the flavor list | Content already rich; ~3 min each, no authoring. |

### B2 — Creature IP cluster (scripted token-swap = the reskin mechanism)

> **Gate before anything:** Adam approves the **IP→generic mapping** (the names are his product/branding
> voice). Proposed mapping below.

**B2.1 · Approve the mapping** (the `Creature Genericization Map` authored in A3n.1):

| IP term | → Generic |
|---|---|
| Beholder | Eye-Tyrant (floating-eye horror) |
| Death Tyrant | Undead Eye-Tyrant |
| Mind Flayer / Illithid | Mind-Thief (tentacled brain-eater) |
| Aboleth | Elder Deep-Thing |
| Modron | Clockwork Law-Construct |
| Slaad | Chaos-Frog |
| Githyanki | Astral Raider |
| Githzerai | Void-Monk |
| Intellect Devourer | Brain-Crawler |
| Chuul | Clawed Drowner |
| Grimlock | Blind Deep-Stalker |
| Quaggoth | Deep-Brute |
| Duergar | Gray Dwarf / Deep-Dwarf |
| Drow | Deep-Elf (dark-elf) |
| Tiefling | Fiend-Blooded |
| Nothic | Secret-Eye |
| Kuo-toa | Fish-Folk Cultist |
| Underdark | the Deeplands / Underdeep |
| Mechanus | the Clockwork plane |
| Limbo | the Churn |
| Elder Brain (Fragment) | Deep-Mind Fragment |

**B2.2 · Scripted token sweep** across the ~22 affected files (10 prose tables the walk engines roll
against + 12 stat-block files), mirroring the executed Phase-2 scrub (69 files / 431 replacements,
scripted, verified). Word-boundary, case-preserving. Guards: skip italic `_spell names_`; leave
`zz_Archive/`; fix find-replace OCR scars. **Prose is load-bearing and survives — only the trademark
nouns move.**

**B2.3 · Rename the 12 stat-block files + `id:` frontmatter** to the generic slug (`Beholder.md` →
`Eye-Tyrant.md`, `id: beholder` → `id: eye-tyrant`) — this makes the scrub and the reskin cards (A3n.3)
resolve to one name.

**Affected files:** Dungeon/Urban Enemy Category · Dungeon Threat Identity (+T2) · Urban Threat Identity
T2 · Wilderness/Urban Contact · Urban Boss · Dungeon Origin · Wilderness Art · Place-Secret · Place
Mythology · NPC Name Megatable · NPC Race Weighted · NPC Common Races · 12 monster stat files
(Aboleth/Beholder/Chuul/Death Tyrant/Githyanki/Githzerai/Grimlock/Intellect Devourer/Mind
Flayer/Modron/Quaggoths/Slaad).

**Gate:** re-grep cluster tokens → 0 outside `Reference/` + `zz_Archive/` + design docs · `compile-tables.py --emit` ·
`check-manifest.py` (the walk engines reference creatures — confirm no dangling id) · `verify-monster-density.mjs`.

### B3 — The irreducible hand-authoring residue (the *actual* re-authoring sweep)

> Voice-bearing. Two options per table, Adam's call: **(a) agent-drafts overnight → Adam reviews/polishes
> in the morning**, or **(b) Adam authors.** Recommended: (a) for the bulk sensory expansions, (b) for
> Art Depiction's IP-laundering (motif judgment) — but draftable either way. Bench every row against
> Place History + Urban Boon (prep doc §5).

**Long pole — do first:**
- **#2 Art Depiction** (L, ~2.5–3h) — full rewrite of rows ~31–100 (intact FR lore: Lurue, Ahghairon,
  Gauntlgrym, Netheril/Mythal, the Bloodhand founding cycle, ~40 proper nouns) keeping each row's MOTIF;
  repair the OCR scars ("the great city Wagons") into ONE coherent invented gazetteer; add a Band column;
  promote `table_class: Spark → Commitment` so the top reaches Mythic; sensory-upgrade the Grounded rows
  (voice_critical). Folds in the IP scrub + genericization-finish in one pass. **Highest single value.**

**Wired `voice_critical` sensory feeders (M each):**
- **#3 Atmosphere Sounds** · **#4 Atmosphere Smells** · **#5 Architecture Material** — expand the thin
  d20s toward d50/d100 + Band ladder; uncanny tails can borrow the audio/scent lens from the Mythic
  Lenses (A1.1). Author #3+#4 together (siblings).
- **#28 Urban Sensory** — add Band, vary sentence shape, push top ~10 to Strange/Volatile; absorbs the
  retired Urban Scene (#6).
- **#27 Dungeon Art Motif** — expand d20→d50 with concrete sensory OR add the Minor-Variation column
  Lighting/Interactable carry.

**Wired Quest tables (M each):**
- **#7 Quest Complication** — d100 + Band, each row see/hear-able. *(Or: re-cast as a lens via A1.1 if
  Adam accepts the vector framing — D-decision flagged in prep doc.)*
- **#19 Quest Urgency** — a concrete felt clock. **#20 Quest Questgiver Avoidance** — verbatim in-voice
  lines. *(All three FALSELY marked Oracle-only by the usage audit — they're wired via `quest-hook.js`;
  real targets.)*

**Wired-via-social-chain (M / S):**
- **#10 NPC Fear** (banded d100 of concrete fears — but A2.1 Condition Lens cheapens it) ·
  **#13 NPC Leverage** (L, register-rewrite, fed by the merged-in #16 nouns) ·
  **#36 NPC Want** (S, add Band + a few uncanny wants).

**Other:**
- **#14 Monster Motivation** (consumed by Region Encounter — blandness propagates; but A2.3
  Trait→Behavior demotes it to a fallback) · **#15 Tavern Encounters** (finish ~10 stubs, half-done).

### B4 — Outlandish d300 reskin (DECIDED: keep all 300, no cut, no shrink)

- **Strip** the trademark Origin column → replace header with `Band` (Fork ceiling = Strange). Kills the
  citation risk + folds onto the standard format. (~180 rows are then near-mechanical: strip + band.)
- **Reskin** the ~90 franchise-named items diegetically (DeLorean → "a horseless gull-winged silver
  chariot whose runes light only when it runs fast enough"; Light-Saber → "a hilt that breathes a
  humming blade of bound starlight"). Use A2.4 Magic-Item Lens for IP-clean substitutes where useful.
- Effort M–L (~1.5–2h); the strip-half is fast even if name-reskins get deferred. Archive originals.

---

## Track D — Monster flavor tables + monster-into-game wiring

*Synthesis of the monster recon (inventory of 374 files · vision-read of the 2024 MM · monster→generator
wiring audit · sample additive rewrites · ecology wiring plan). Headline constraint: Adam's hand-authored
monster custom d10 tables are HIS — every monster-file pass is **additive + archive-first**, never a blind
overwrite; agents return proposed diffs as text, no agent writes to his files directly.*

### D0 — The three findings that shape the track

1. **A strong per-monster flavor format already exists and is Adam's** — the `d10 Tone Variance`
   (encounter-premise) + `d10 Investigation/Loot & Clues` pattern (Goblins, Wight, Bullywug). It's
   Place-History-grade in spirit but covers only **~29 of 374** files. The corpus is bimodal:
   **~189 bare stat-block files (~51%)**, ~156 prose-but-no-tables, **~66 rich** (~18%). ~40 files carry
   a custom `d10`. Iconic high-CR creatures are often thin (**Aboleth, CR 10, has zero flavor**).
2. **The MM 2024 has a real, portable per-monster structure to MINE** — every entry carries a
   **`Habitat: <terrains> · Treasure: <category>`** tag line (the exact biome/loot keying the generators
   lack) + a small **d4–d8 flavor table** ("Superstitions / Lures / Cravings") + behavior prose. *Mine the
   TAG LINE + the table's THEME; author the table itself to Genesis's banded d10 bar* (the MM's single d4
   is below Adam's own d10s). **Quest-hook structure comes from DMG Ch.3–4** (Villain Schemes / Methods /
   Hooks), per `DMG-MM Resource Strategy.md`. Never paste; genericize proper nouns ("Lower Planes" →
   "the Below").
3. **The bestiary is 100% UNWIRED.** Nothing in `src/`/`data/`/`build/` reads the 374 files. Generators
   pick creatures as **bare name strings** (`walkPickFromPool` at `src/engine/walk.js:154`) — no index, no
   biome-keying, no day/night, no CR-coupling, and **the monster files' own flavor/hook tables are never
   compiled or surfaced.** The richest, most anti-drift-aligned monster content in the repo never reaches
   the DM. Wilderness is the weakest leg (its primary threat table is creature-agnostic).

> **Anti-drift scorecard:** today, on an Enemy encounter the engine owns ~0% of the monster (a name) and
> the DM invents biome-fit, behavior, signs, hooks, and stats. After this track the engine owns the
> creature's CR, biome-fit, role, stat sheet, sign-of-presence, and a candidate hook — the DM only
> interprets. The single largest un-mechanized surface in the game.

### LANE A (autonomous-safe overnight) — the bestiary SUBSTRATE (new/additive, gated, behavior-neutral)

> These build the machinery WITHOUT changing runtime behavior (not yet wired into the walks). Reversible,
> gate-checked, no edits to Adam's authored tables.

- **D-A1 · Bestiary index generator** (M) — `build/gen-bestiary.py` → `data/bestiary.js` (`owns
  BESTIARY`), parsing every monster file into `{slug, name, cr, role, habitat[], activity[], faction_fit[],
  signTableId, hooksTableId}`. **Partial-bootstrap autonomously:** `cr` + `name` parse from the existing
  `**Challenge:**` line / filename today; `role`/`habitat`/etc. populate from the D-B1 tagging pass (Lane
  B) and default to empty until then. Register in `manifest.json`. **Gate:** extend
  `verify-monster-density.mjs` to assert index coverage + `check-manifest.py`. **Autonomous: YES.**
- **D-A2 · Compile per-monster tables** (M) — extend `compile-tables.py` (or a sibling) so the
  `### dN <Creature> Sign / Hooks` tables inside monster files emit into `tables.json` with stable ids
  (`sign-<slug>` / `hooks-<slug>`), so a roller can address them. (Today they live outside the Engine table
  tree and compile to nothing.) **Gate:** compile + manifest. **Autonomous: YES** (reads existing tables;
  no monster file is edited).
- **D-A3 · Ecology selector module** (M) — `src/engine/bestiary.js`: `pickCreature({biome, crBand, slot,
  activity, faction})` filters `BESTIARY` by habitat∩biome, role/slot, CR window, day/night, with a
  **fallback to the raw string when no match** (so wiring it later keeps headless tests green). Ship the
  module + `dev/verify-bestiary.mjs` **without wiring it into the walks** (that swap is Lane B). **Gate:**
  new verify harness + manifest. **Autonomous: YES** (standalone module, not yet called).

### LANE B (propose-and-wait / reviewed) — ACTIVATION + content (touches his files / changes behavior)

- **D-B1 · Frontmatter ecology-tagging pass** (L) — add `cr · role · habitat[] · treasure · activity[] ·
  faction_fit[]` to each monster file's frontmatter, derived by vision-reading the MM `Habitat/Treasure`
  tag line + the stat block CR (PDF must be **rendered to PNG via PyMuPDF** — it exceeds the Read tool's
  text limit; never trust the OCR layer). **Additive frontmatter, but it edits his files → archive-first.**
  Fan out **one agent per CR band** (`<1, 1, 2, 3, 4-5, 6-7, 8-10`), each returning diffs as text.
  Prioritize the **wired creatures** (everything named in `dungeon/urban-threat-identity` +
  `wilderness-enemy-category`) so D-A1's index gets real tags where it pays off first; then the thin
  capstones (Aboleth, Beholder, dragons — the density verifier flags CR 9-10 as thin).
- **D-B2 · Per-monster flavor + hook authoring** (L, agent-draft → Adam review) — each file gains a banded
  `### dN <Creature> Sign/Tell` (Spark/Fork) + `### dN <Creature> Hooks` (Fork) authored to the Place-History
  bar (samples below). **Archive-first on the ~40 files with existing custom d10s; never duplicate his
  "Tone Variance" — band it in place (D2) and treat the new Hooks table as complementary.** Same CR-band
  fan-out, **wired-creatures-first.** Bench every row against Place History + Urban Boon.
- **D-B3 · Wire the selector into the walks** (M) — replace the `walkPickFromPool(string)` calls in
  `wild-walk.js` / `dungeon-walk.js` / `walk.js` with `pickCreature(...)` resolving from the index; keep the
  string fallback. **Changes runtime behavior → reviewed.** **Gate:** `verify-walk.mjs` + `verify-monster-density.mjs`.
- **D-B4 · Surface flavor + hook in the digest** (M) — extend `prep-bundle.js` so an Enemy encounter casts
  a **monster atom** (resolved slug → its `sign`/`hooks` tables rolled) into the codex cast + DM digest; the
  "sign of presence" becomes the threat-telegraph `DIFFICULTY.md` wants. **Gate:** `verify-prep*.mjs` + `verify-codex.mjs`.
- **D-B5 · Re-author the thin Engine monster tables** (S) — `Monster Motivation` (#14) / `Behavior if
  Hunted` (#22) / `Meal Viability` (#30): banded + sensory; the selector prefers a creature's OWN sign/hook
  table when one exists, falling back to these. **(Same items as Track B3 — do once.)** A2.3 Trait→Behavior
  demotes these to fallbacks.
- **D-B6 · Faction-coupling (stretch, L)** — a ledger faction's `creature_affinity` biases the selector.
  Defer until D-A/B1–4 land.

**Critical path:** D-A1 → D-A2 → D-A3 (substrate, overnight) → D-B1 → D-B3 → D-B4 (activation), with D-B2
authoring running **in parallel, wired-creatures-first**, so the surfacing step has rich tables to show the
day it ships.

### Sample target format (from the recon — the bar for D-B2)

Banded, sensory-first, IP-clean. A *sign/tell* table is Spark/Fork (≤ Strange); a *hook* table is Fork.

**Aboleth — "The Water Remembers" (sign of presence, d10 Fork; 5 G / 3 T / 1 S / 1 V):**
1. (G) The well water tastes faintly of brine, this far from any sea. · 5. (T) A villager recites a
childhood memory that is unmistakably *yours*, smiling. · 8. (S) Three strangers say, in the same flat
voice, "We have wanted you a long time." · 10. (V) The tide comes in underground — and your oldest secret
comes in with it, spoken aloud by the dark.

**Aboleth — "What the Deep Wants With You" (hook, d10 Fork):** 2. (G) A flooded mine the diggers won't
re-enter — they say the water "answers back," and one of them is missing. · 8. (S) A town that drowned a
century ago is back, dry, populated, and very glad to see you; they remember a promise you never made. ·
10. (V) A coastal city's entire ruling council shares one mind now, patient and ancient, inviting you to
join before the rest of the coast does.

*(Full Aboleth / Otyugh / Wight samples in the recon transcript; Otyugh's "Lure" table is the MM-d4-mined-to-Genesis-bar exemplar.)*

---

## Recommended execution order

**Tonight (Lane A, unattended, gate-chained):**
A1.1 → A1.2 → A1.3 → A2.1 → A2.2 → A2.3 → A2.4 → A3n.1 → A3n.2 → A3n.3 → **D-A1 → D-A2 → D-A3.**
Each ends in compile + manifest (+ its verify harness); a red gate stops the chain and reports. Net: the
full recontext machinery + new content tables + the bestiary substrate (index/compile/selector, all
behavior-neutral), ready to wire.

**Morning session (Lane B, Adam in the loop):** approve the creature mapping (B2.1) → run B1
consolidation (with the A1.3 similarity report in hand) → B2 creature scrub → then choose authoring focus
(Art Depiction B3 first) and the monster activation chain (D-B1 tagging → D-B3 wire → D-B4 surface), with
the D-B2 per-monster authoring fanned out wired-creatures-first. Agent-draft-then-review vs. self-author
is a per-table call.

**Note on the overnight chain & destructive boundary:** every Lane-A step is purely additive (new files /
new gated code; the one behavior-touching risk — D-A3's selector — ships *unwired*). Nothing in the
overnight chain deletes, renames, or rewrites an Adam-authored table. All of that waits for the morning
propose-and-wait session, per Adam's call.

---

## Verification gates (every step)

- **After any table edit:** `python3 "Engine/00. _System/compile-tables.py" --emit` — resolve
  `starts-high` flags; never hand-edit `tables.json`/`tables.js`.
- **After any module/manifest edit:** `python3 build/check-manifest.py`.
- **Targeted runtime:** `dev/verify-lenses.mjs` · `dev/verify-compose.mjs` · `dev/verify-trait-behavior.mjs`
  (new) · `dev/verify-monster-density.mjs` · `dev/verify-codex.mjs` · `dev/verify-social.mjs` as touched.
- **On completion of a unit of work:** the `genesis-clean-close` ritual (CHANGELOG + HANDOFF +
  NEXT-STEPS together, branch `type/slug`, `--no-ff` merge).
