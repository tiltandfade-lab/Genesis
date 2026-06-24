---
type: design-doc
branch: Genesis
status: living
created: 2026-06-18
canonical: true
related:
  - "[[DESIGN]]"
  - "[[NEXT-STEPS]]"
  - "[[genesis.html]]"
  - "[[HANDOFF]]"
---

# Genesis — Character Creation (canonical)

The PC-creation layer for Genesis. Settles NEXT-STEPS item 14 (the `(a)/(b)/(c)` fork) and specs the build. `DESIGN.md` holds the world-level locked decisions; this holds the character-level ones. Update in the same change as any char-gen architecture decision.

## The fork, resolved (2026-06-18)

The `(a)` full-auto / `(b)` light-spark / `(c)` hybrid fork was mis-framed as one axis. Building it surfaced two facts that re-shape it:

1. **The mechanical crunch isn't queryable yet.** `classes.json` / `classes-species-backgrounds-feats.json` are name+page indexes only; the L1 detail (hit die, proficiencies, armor training, starting-equipment A/B, L1 features) lives as *prose* in `classes.md`. So pure `(a)` auto-fill carries an unbudgeted dependency: structure all 12 classes' prose into JSON first. The cheap derived numbers (HP, AC, mods, saves, passive Perception) are one-line formulas; the *expensive* lookups (feature text, gear specifics) are exactly what the locked **rules-by-pointer** architecture says to leave in `SRD-Data` and resolve at weave-time.

2. **Adam's Xanathar's "This Is Your Life" suite is a *different layer*, not an alternative.** It is the *biographical* layer (parents, childhood, formative life events), orthogonal to the mechanical *sheet* (class/species/scores/feat/gear). It supersedes the hand-invented `SPARK` flat list and the proposed Want/Fear/Trauma/Grace/Instrument spine — it is the canonical, deep, roll-chain version of exactly that idea.

**Resolution: `(c)` hybrid, expressed as two interlocking layers.**

| Layer | What it is | Where the work happens |
|---|---|---|
| **The Sheet** (mechanical) | Guided SRD L1 build: species · class · background · ability scores · origin feat · derived numbers · starting gear | Player *chooses* (DM-agency); engine computes cheap derived numbers; heavy class-feature/gear text stays as **`SRD-Data` pointers** the AI DM resolves at weave-time — never duplicated into char-gen |
| **The Life** (biographical) | Xanathar's **"This Is Your Life"** roll-chain: Origins → Personal Decisions → Life Events → Supplemental | Player *rolls openly*; engine fans out the roll-chain; AI DM **guides the player through it** in chat and weaves results |

The two **interlock**: the Sheet's chosen **background** and **class** key directly into The Life's "I became a ___ because…" tables. Pick Soldier/Fighter → the biography rolls the Soldier and Fighter origin-of-vocation rows. One choice drives both layers.

## Why this is the right shape for Genesis (not just for D&D)

- **Roll-chain native.** TIYL is primary tables (Parents, Birthplace, Family) → secondary (Tragedies, Boons, War) → supplemental (Race, Status, Relationship). That is the engine's native fan-out and the **Fragment-oracle** pattern: player rolls openly, sees a sensory hook, DM reveals the row through narration.
- **Lazy by the book.** XGE opens with *"Ideas, Not Rules — use as much or as little as you want."* That is identical to Genesis's lazy-history: the past is unwritten until inquired, then rolled and made canon. **Rolling a soul into being mirrors rolling a world into being** — the defining Genesis motion, now applied to the character.
- **It generates world-state, not flavor.** Life Events emit canon: *"you made an enemy of an adventurer," "a lover disappeared," "a family member died — roll Cause of Death."* Each is a Ledger entry + a seed NPC + a live thread the reincorporation / NPC-life-events / lie-motive systems can resurface. **Character-genesis seeds the world.**

## Layer 1 — The Sheet (guided L1 mechanical build)

Built into `genesis.html`, inline data + cheap formulas; heavy text by pointer.

**Player chooses (open, DM-agency):**
- **Species** — Dragonborn · Dwarf · Elf · Gnome · Goliath · Halfling · Human · Orc · Tiefling (SRD 5.2.1, 9).
- **Class** — the 12 (Barbarian … Wizard). Drives hit die, primary ability, save profs.
- **Background** — the 4 SRD 5.2.1 (Acolyte · Criminal · Sage · Soldier) **plus 6 Genesis-native, SRD-safe** ones (Bog-Iron Digger · Glass-Singer · Hearth-Watch · Crier · River-Rat · Pilgrim), each tied to a faction/setting already in the world tables and using only SRD origin feats. Grants the **origin feat** (Magic Initiate / Alert / Savage Attacker / Skilled) + the +2/+1 (or +1/+1/+1) ability bumps + 2 skills + a tool. Native packages + "I became…" tables: `Engine/03._Tables/04. Character Genesis/Genesis Backgrounds.md`.

**Player rolls (open):**
- **Ability scores — open roll, 4d6 drop lowest, ×6** (locked 2026-06-18; the dice-transparency method). The six values are rolled in the open and **assigned by the SRD "Standard Array by Class" priority as the default**, then the player may **drag (or tap two) to reassign** any score onto any ability (a "↺ Best for class" button restores the default). The background's +2/+1 bonus stays pinned to its abilities regardless of which rolled value sits there. Standard Array and Point-Buy remain available as alternates (deferred; open-roll is the default path).

**Engine computes (cheap, deterministic):**
- Ability **modifiers** (score → mod table).
- **HP** at L1 = class base (Barb 12 / Fighter-Paladin-Ranger 10 / most 8 / Sorc-Wiz 6) + Con mod.
- **AC** = 10 + Dex mod (base; armor/shield refinements deferred to gear step / DM).
- **Proficiency Bonus** = +2.
- **Passive Perception** = 10 + Wis mod (+2 if Perception-proficient).
- Save-proficient abilities (from class), skill list (from class+background) — **named, not auto-numbered** beyond the formula above.

**Engine points (never duplicates):**
- Class L1 features, starting-equipment A/B, feat text, spell options → **pointers into `SRD-Data`** (`classes.md`, `equipment-*`, `spells.json`, `character-origins-feats.json`). The AI DM resolves these at weave-time. Casters' cantrip/spell selection is a DM-guided step, not an in-app picker (v1).

## Layer 2 — The Life (Xanathar's "This Is Your Life")

The biographical roll-chain. **Now genericized + IP-clean (2026-06-19):** the live suite is `Life & Origins.md` — original prose, all Wizards product-identity terms scrubbed, spice-graded. Its *structure* (dice, ranges, branch logic, seeding) was seeded by Xanathar's "This Is Your Life," which is retained heritage-only in `zz_Archive/` and is not compiled. Mirrored inline into `genesis.html` for the live ritual (the app still runs on inline data — Track B will wire it to `tables.json` later).

**The chain (player rolls openly; DM guides):**

1. **Origins** — Parents (d100, + non-human parent variants) · Birthplace (d100, 00 = strange omen) · Siblings (Number d10, Birth Order 2d6) · Family (d100) · Absent Parent (d4) · Family Lifestyle (3d6 → modifier) · Childhood Home (d100 + modifier) · Childhood Memories (3d6 + Cha mod).
2. **Personal Decisions** — Background "I became a ___ because…" (d6) **keyed to the chosen background** · Class Training "I became a ___ because…" (d6) **keyed to the chosen class**. *(XGE covers all 13 PHB backgrounds + 12 classes; Genesis's L1 sheet exposes the 4 SRD backgrounds — the other 9 background tables ship as data for hand-pick / future expansion.)*
3. **Life Events** — Life Events by Age (d100 → age band + # of events; default age band yields 1–1d4 events) → each event rolls Life Events (d100), branching to secondary tables: Adventures (d100) · Arcane Matters (d10) · Boons (d10) · Crime (d8) + Punishment (d12) · Supernatural Events (d100) · Tragedies (d12) · War (d12) · Weird Stuff (d12). **Embedded choose-one sub-rolls resolve deterministically (2026-06-23):** a secondary-table outcome that offered an unresolved "or" menu (Punishment "jailed / at the oar / hard labor / or you escaped," a relationship ending in bitterness-or-peace, an apothecary's draught-or-acid, the missing ear/fingers/toes, the sickness's lingering mark, the supernatural rider's nature) is now written `{a | b | c}` in the table source and the engine rolls one option uniformly at roll time, baking the single outcome into the prose — the same treatment as inline dice (`1d4`). The player never gets an ambiguous menu to interpret.
4. **Supplemental** (called by other tables, or on demand): Alignment (3d6) · Cause of Death (d12) · Class (d100) · Occupation (d100) · Race (d100) · Relationship (3d4) · Status (3d6).

**Roll depth — guided, DM-led (Adam's call 2026-06-18).** Not "skeleton vs full autobiography" as a fixed setting: the **AI DM walks the player through the chain**, the player rolls each table openly, the DM weaves each result. The app provides the roll buttons + records the results to the character layer; the *guiding* is the DM in chat (same app=oracle / chat=narrative split as the rest of Genesis). The ritual's in-app default fires a coherent spine (Origins + the two keyed Personal-Decision rolls + an age-scaled Life-Events pass); deeper supplemental detail is rollable on demand, exactly like lazy-history.

## The auto-seed (character-genesis seeds the world)

**Locked: backstory figures and threads auto-write into the World State Ledger as canon (Adam's call 2026-06-18).** When a Life Event produces a person or an open thread, the ritual emits Ledger entries at bind-time:

- **People** → `npc-life` (reserved type, now first-used) or `canon` NPC entries + a gazetteer `NPC` row: the enemy made, the friend made, the lost lover, the dead/【missing】family member, the former patron/employer, the life-debt commoner.
- **Threads** → `canon` open-thread entries: a wanted-for-crime status, a vow of vengeance, a missing lover being searched for, an unfulfilled ancestral quest, a curse/disadvantage carried in.
- These become live fuel for **reincorporation**, **NPC life-events**, and the **lie/motive** systems — the character's past is world-state, retrievable, never re-rolled (write-once canon, same discipline as world facts).

Seed entries are tagged `source:"char-genesis"` + the originating character id, so a successor's backstory doesn't silently overwrite a predecessor's threads.

## Successor reuse

Death rolls the existing **fate d20 (≥11 = successor)**. The successor is **generated by this same ritual** — a new soul rolled into being, optionally inheriting proximity to the predecessor's unresolved threads (the Ledger already holds them). The generator *is* the successor generator; no second code path.

## The headline (retiring SPARK)

The flat 12-line `SPARK` list is **retired**. In its place, the ritual derives a **one-line headline** from the rolled layers (e.g. *"a {background} {species} {class} who {strongest-life-event hook}"*) for the at-a-glance character strip. The depth lives in the layers; the headline is just the card label. No separate hand-authored spine structure is maintained.

## Data placement (edit-source → compile)

- **Source of truth:** `Engine/03. _Tables/04. Character Genesis/Life & Origins.md` (the genericized, public-safe biography suite) + `Genesis Backgrounds.md` (native + standard-archetype background packages) + the procedure doc `Engine/02. _Procedures/Character Genesis Procedure v1.0.md`. The XGE transcription is heritage-only in `zz_Archive/`. Hand-editable, matches the existing table-file format.
- **Runtime:** mirrored as inline data in `genesis.html` (the app runs on inline data until Track B's `tables.json` pipeline lands). When Track B runs, this suite compiles like any other table; **never hand-edit the compiled artifact.**
- The Sheet's mechanical formulas live in `genesis.html`; the *reference* it points at stays in `SRD-Data`.

## IP / genericization flag (deferred, logged)

**RESOLVED 2026-06-19 — the biography suite is now genericized.** The live `Life & Origins.md` (and the `genesis.html` inline `CG`) is original prose with all Wizards product-identity terms scrubbed (no named planes, no fey/fiend/aberration proper nouns, no named monsters/items/spells), graded along the spice bands. A headless IP-scrub check guards against regressions. The XGE transcription survives heritage-only in `zz_Archive/` (not compiled). The 9 standard-archetype **backgrounds** were likewise rebuilt IP-clean (own packages + own prose). Public-release-clean for character genesis; the broader monster/genericization work continues in `GENERICIZATION-SCAN.md`.

## Character persistence shape (the layer in the world save)

Extends the existing `character` object (keeps `id`, `name`, `status`, `bornAt`, `bornWhere`, `fellWhere`, `fate`). Added:

```
sheet:   { species, class, background, feat,
           scores:{str,dex,con,int,wis,cha}, mods:{…},
           hp, ac, profBonus, passivePerception,
           saveProfs:[…], skillProfs:[…], hitDie }
life:    { origins:{parents,birthplace,siblings,family,absentParent,
                    lifestyle,childhoodHome,childhoodMemory},
           decisions:{background, classTraining},
           events:[ {roll, table, result, seedRefs:[…]} … ],
           age }
headline: "a Soldier Human Fighter who …"
seeds:    [ ledgerEntryId … ]   // what this soul wrote into the world
```

Migration is additive (old characters keep working; `sheet`/`life` absent = legacy light character, render the old `spark`/headline).

## Open questions / deferred

- **Score-method alternates** — Standard Array + Point-Buy UIs (open-roll ships first).
- **Caster loadout in-app** — v1 leaves cantrip/spell + gear A/B selection to the DM-guided step; a later pass could pull pickers from `spells.json` / `equipment-*`.
- **Backgrounds** — the L1 sheet now supports **19**: 4 SRD + 6 Genesis-native + 9 standard archetypes (rebuilt IP-clean). Add more following `Genesis Backgrounds.md` §Adding more (SRD-feat-only discipline).
- **Genericization pass** for public release (above).
- **Armored AC / shield** refinement at the gear step (v1 = base 10 + Dex).

## Decision log

| Date | Decision | Choice |
|---|---|---|
| 2026-06-18 | The `(a)/(b)/(c)` fork | **`(c)` hybrid**, expressed as two interlocking layers (Sheet + Life) |
| 2026-06-18 | Biography layer | **Adopt Xanathar's "This Is Your Life"**; retire the flat `SPARK` and the proposed 5-slot spine |
| 2026-06-18 | Ability scores | **Open roll, 4d6 drop lowest ×6**; class-priority suggested assignment, player/DM may override |
| 2026-06-18 | Roll depth | **Guided, DM-led** — player rolls openly on the tables, DM walks them through; app rolls+records, chat weaves |
| 2026-06-18 | Backstory → world | **Auto-seed** figures + threads into the Ledger as canon (write-once), tagged to the originating soul |
| 2026-06-18 | Mechanical detail | **Cheap derived numbers computed in-app; heavy feature/gear/spell text by `SRD-Data` pointer**, never duplicated |
| 2026-06-18 | Successor | **Same ritual** generates the successor; no second code path |
| 2026-06-18 | IP | XGE content is **not SRD** — genericize before public release (deferred, logged) |
| 2026-06-19 | Score assignment | **Drag / tap-to-reassign**, defaulting to best-by-class; background +2/+1 stays pinned; "↺ Best for class" resets |
| 2026-06-19 | More backgrounds | Added **6 Genesis-native** (Bog-Iron Digger, Glass-Singer, Hearth-Watch, Crier, River-Rat, Pilgrim) **+ 9 standard archetypes rebuilt IP-clean** (Charlatan, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sailor, Urchin) — own packages + own prose, SRD feats only. **19 total.** Source: `Genesis Backgrounds.md` |
| 2026-06-19 | Genericize the biography suite | Rewrote the XGE "This Is Your Life" chain into original, IP-clean, spice-graded prose as `Life & Origins.md` (+ `genesis.html` inline `CG`/`CG_CLASS`); dice/ranges/tags/seeding preserved. XGE transcription archived heritage-only. Headless IP-scrub guard added. Closes the IP-flag for character genesis |
