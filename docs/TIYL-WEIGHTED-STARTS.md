---
type: system-spec
status: "SPEC — drafted by Fable 2026-07-08, awaiting Adam's review"
owner: creator lane (bardo / char-genesis / entry bridge)
siblings:
  - "[[ANIMAL-SOCIAL]]"          # drafted concurrently — the wilderness-start rider lands there
  - "[[CHAR-CREATION]]"
  - "[[NEW-GAME-FLOW]]"
  - "[[DEATH-AND-REBIRTH]]"      # rollFactionProximity — the weighting precedent this spec extends
---

# TIYL-WEIGHTED-STARTS — class-weighted origins

> **Adam's brief.** Character starts should lean into archetype-true openings — bards start in
> cities/taverns/on the road with a troupe; warriors in barracks, on battlefields, or scouting;
> and (the motivating case) a wood-elf ranger or druid should be able to **start and stay
> wilderness-native** — the whole early game reachable without a city. "That could be fleshed
> out so much more and should."
>
> **The one law:** weights, not locks. A city-born ranger stays possible; the dice *lean*, they
> never railroad. Every start row remains reachable by every class.

---

## §1 What exists today (inventory — read before building)

Adam is right that "something like that" already exists. Precisely:

**The TIYL chain (This Is Your Life, XGtE heritage).**
- Source table: `Engine/03. _Tables/04. Character Genesis/Life & Origins.md` (active) and
  `…/zz_Archive/This Is Your Life (XGE heritage).md` (superseded — do not audit the archive).
- Data: `data/character-genesis.js` — the `CG` lookup tables. **`CG.birthplace` is a d100,
  entirely class-blind** (1–50 "At home" … 73–74 "Deep in a forest" … 81–82 "In a tavern or inn"
  … 100 "Somewhere no living thing should be born").
- Engine: `src/creator/life.js` — `cgRollLife()` / `cgLifeStepRoll()` (the per-beat bardo queue),
  `cgMakeEvent()`, `seedFromLife()` (writes npc-life/thread/mark seeds to the ledger),
  `tiylBackfillPeople()` (mints full codex NPCs from those seeds, SD-004/SD-005 fixes live here).

**Class-aware pieces that ALREADY exist (the thing Adam remembers):**
1. **`CG_CLASS` / `CG_BG`** (`data/character-genesis.js:70`) — a d6 "why your calling / why your
   background" table **keyed per class and per background**. This is flavor prose only; it does
   not move the start location. It IS the class-keyed-sub-table precedent.
2. **`CLASS_FACTION_AFFINITY` + `rollFactionProximity`** (`data/srd-creator.js:140`,
   `src/engine/world-gen.js:66–77`, from DEATH-AND-REBIRTH step 4) — class → faction-kind
   affinity applied as a **weighted duplicate-array pick (4× top kind, 2× other listed, 1× rest)**.
   This is the codebase's canonical "class leans the dice, never locks them" mechanism.
3. **`regionArchetypeWeight` / `regionBiasedArchetypePool`** (`src/engine/region.js:277,293`) —
   multiplier-style weighting (1.6× on a keyword match against a freeform bias string) applied
   as a roll-twice-keep-preferred nudge. Precedent for **keyword-classifying prose rows instead
   of editing the tables** (its sibling `METHOD_KIND`, `data/srd-creator.js:131`, classifies
   faction methods by regex — same shape).

**Where the start is actually decided (all class-blind today):**
- **The physical start place** = the bardo *hometown* beat (`src/creator/bardo.js:14`,
  `{t:"hometown",beat:"setting",id:"place-master-setting"}`) rolling the **Master Setting d100**
  (`Engine/03. _Tables/01. World Building/Place Generation/Master Setting.md`, spice-graded,
  Commitment class). The PC's `bornWhere` = `GS.CGEN.spawnWhere || w.seed.master.name`
  (`src/creator/sheet.js:48`); the world's origin node is that settlement (`src/world/play.js:66`).
- **The opening situation** = `rollEntry(w,c)` (`src/engine/world-gen.js:78`) — `SS.eWhyHere`
  (d12), `SS.eFoot` (d12), `SS.eStanding` (d10) in `data/starting-state.js:27–29`, plus the
  Enemies/Friends/Complications/Things/Places bundle. Uniform dice, no class input except the
  faction-proximity weighting above.
- **TIYL birthplace** (`CG.birthplace`) — narrative origin, class-blind d100.

**So the gap, precisely:** class already tilts *which faction you're near*; nothing tilts
*what kind of place you wake in*, *why you're there*, *your foot in the door*, or *where you
were born*. Master Setting, eWhyHere, eFoot, and CG.birthplace are the four class-blind rolls
this spec weights.

---

## §2 The weighting model (DECIDED, pending Adam)

### Mechanism candidates

| Option | Shape | Verdict |
|---|---|---|
| **A. Class-keyed sub-tables** | 12 parallel start tables (like CG_CLASS) | ❌ for the location rolls — 12× authoring burden on a 100-row Commitment table, forks Adam's hand-authored craft surface, and a sub-table is a soft lock (a bard can never roll the barrow-camp). Right shape only for short flavor prose (CG_CLASS already does this). |
| **B. Modifier column** (+N to the d100 by class) | like `cgLookup(key,mod)`'s existing `mod` arg | ❌ — a flat +N shifts the whole distribution toward high rows, which on spice-graded tables means *class buys spice*, not *class buys flavor*. Wrong axis. |
| **C. Tag-affinity weighted pick** ✅ | classify each row into start-context tags; multiply row weight by the class's affinity; roll the weighted distribution | **Recommended.** It is `CLASS_FACTION_AFFINITY` + `METHOD_KIND` generalized: the exact weighting idiom this codebase already trusts, applied to rows instead of factions. Weights, never locks — every row keeps weight ≥ 1. |

### Decision C, concretely

1. **Start-context tags** (one small closed vocabulary, ~9 tags):
   `urban · road · wild · maritime · martial · sacred · underside · scholarly · frontier`.
2. **Rows are classified, not edited.** A `START_CONTEXT` regex classifier
   (new `data/start-affinity.js`, same shape as `METHOD_KIND`) maps row text → tags
   (`/tavern|inn|street|market|city|slum/→urban`, `/forest|wild|beast|grove|fen|hunt/→wild`,
   `/battle|garrison|fort|war|soldier/→martial`, …). **No destructive edits to Adam's
   hand-authored tables** (they're his — CLAUDE.md), no recompile step, and new/re-authored
   rows classify themselves. Rationale: identical to how `factionKind` reads Adam's freeform
   faction methods and `regionArchetypeWeight` reads freeform bias prose.
3. **`CLASS_START_AFFINITY`** (same file): class → ordered tag list, same 4×/2×/1× weight ladder
   as `CLASS_FACTION_AFFINITY` (first tag strongest). Optionally background adds its top tag at
   2× (see rulings) — species stays OUT of v1 (species is a body, not a life; the wood-elf lean
   arrives via the ranger/druid class weights, and Adam can revisit).
4. **One new helper, `startWeightedLookup(tblKey, cls)`** (in `src/creator/life.js` or a small
   `src/creator/start-weights.js`): builds the per-row weight vector
   (`w = affinityWeight(maxMatchingTag)`, default 1), rolls the weighted distribution, and
   returns the same `{roll,total,text,tag}` envelope as `cgLookup`/`rollTbl` so every consumer
   and the bardo's shown-roll UI keep working. The *shown* die is the row's own band position
   (the player still sees an honest d100 result row; the lean lives in which row got picked —
   same honesty model as `regionBiasedArchetypePool`'s reroll nudge).
5. **Wired at exactly four call sites:** the bardo hometown `place-master-setting` beat,
   `CG.birthplace` in the life chain, and `SS.eWhyHere` + `SS.eFoot` in `rollEntry`.
   `eStanding` stays unweighted (standing with the power is fortune, not archetype).
   **Spice bands are untouched** — weighting is *within* the flavor axis; a Mythic row's weight
   is scaled the same as a Grounded one, so the spice curve's authored distribution shifts only
   as far as tag correlation forces it (test guards this, §5 U4).

### Why not lean harder

A 4×/2×/1× ladder on a d100 where ~15–25 rows match the top tag gives the archetype-true
opening roughly a 45–60% share (vs ~20% flat) while leaving every single row live. That's a
*lean you can feel across three characters*, not a script. The multiplier is one constant —
Adam tunes it by taste (ruling R1).

---

## §3 Class start-flavor profiles (the 12 sketches)

Direction for `CLASS_START_AFFINITY` + the CG_CLASS-style opening-flavor line. Tags in
priority order; 2–3 lines each, flavor not tables.

- **Bard — `urban, road`.** Taverns, market squares, the road with a troupe; born where there's
  an audience. Foot-in-the-door leans toward *an old acquaintance*, *a patron's eye*, *kin here*.
- **Fighter — `martial, road`.** Barracks, garrisons, the field after the battle, a scouting
  commission gone quiet. Why-here leans *sent or summoned*, *recruited for this, specifically*.
- **Ranger — `wild, frontier`.** Wilderness-native (§4): the fen, the treeline, the last farm
  before the map fails. Can start and STAY outside walls; the settlement is somewhere they
  *visit*.
- **Druid — `wild, sacred`.** Grove, standing stones, a circle that answers to no charter.
  Wilderness-native like the ranger, but the wild is a congregation, not a range.
- **Rogue — `underside, urban`.** Alleys, sewers, the room behind the tavern; born on the
  rubbish-heap side of town. Standing leans *watched, or marked* — earned.
- **Cleric — `sacred, urban`.** Temple, shrine, the order's hospice; why-here leans *sent or
  summoned*, *on a pilgrimage or under a vow*.
- **Paladin — `sacred, martial`.** The order's chapterhouse and the war it rode to; a
  battlefield birth reads as omen, not accident.
- **Wizard — `scholarly, urban`.** The academy, the scholar's laboratory, an apprenticeship
  that ended (or didn't). Foot-in-the-door leans *a letter of introduction*.
- **Warlock — `underside, sacred`.** The aftermath of the pact: wherever the bargain was
  struck — crossroads, hidden hall, a place of deep and living shadow. The start is the debris
  field of the deal.
- **Sorcerer — `frontier, wild`.** The incident: the village that remembers what happened, the
  field that still won't grow. Starts near the scorch mark, welcome or not.
- **Barbarian — `frontier, wild`.** The far country: among a people not your own is *everyone
  else's* line — here it inverts; the settlement is the foreign place.
- **Monk — `sacred, road`.** The monastery road: the cliffside switchbacks, the wayhouse
  between mountains, walking a discipline from one quiet place to the next.

---

## §4 Wilderness-viability rider (the motivating case)

A ranger/druid whose weighted rolls land a `wild`-tagged Master Setting row must get a start
that is *actually playable without a city*:

- **Seed animal contacts, not tavern NPCs.** When the start context resolves `wild`, the entry
  bundle's Friends/Complications slots and `tiylBackfillPeople` draw from the **[[ANIMAL-SOCIAL]]**
  layer (sibling spec, drafted concurrently): the heron that knows the fen, the wolf-pack whose
  tolerance is a Standing, the crow that trades. The `friend`/`important` TIYL seeds keep their
  Standing-ladder openings (`TIYL_REL_ATTITUDE`) — the attitude machinery is species-agnostic
  by design.
- **The gazetteer's opening Places** come from wilderness place stock (grove, ford, den,
  ridge-line cache) instead of the settlement's streets; the origin node keeps its Master
  Setting name (it may BE "the Walled Orchard['s] treeline") but the opening scene stands
  outside it.
- **Nothing is removed** — the settlement exists, factions exist, the doom still comes from the
  northwest. Wilderness-native means the early game is *reachable* without walls, not that
  walls are gone.
- Contract: this spec owns the *trigger* (start context = `wild` → route contact-seeding to the
  animal layer); ANIMAL-SOCIAL owns the contacts themselves. If ANIMAL-SOCIAL hasn't landed,
  U3 degrades to a flagged `w.startContext="wild"` + ordinary seeding (no dangling calls).

---

## §5 Build units (Sonnet-executable, in order)

Each unit: red-first test in the jsdom harness (load real `genesis.html`, all modules in
document order), then implement, then `python3 build/check-manifest.py` green.

**U1 — `data/start-affinity.js`: tags + classifier + affinity map.**
New data module (register in `manifest.json`, owns `START_CONTEXT`, `CLASS_START_AFFINITY`,
`startContextOf`). `startContextOf(text)` → array of tags via the regex ladder; pure, no state.
*Red-first:* assert `startContextOf` on 12 fixed strings (one per tag + two no-match) before
the module exists. *Acceptance:* every row of Master Setting, CG.birthplace, eWhyHere, eFoot
classifies without throwing; ≥60% of Master Setting rows get ≥1 tag (untagged rows are fine —
they stay weight 1 for everyone); check-manifest green.

**U2 — `startWeightedLookup` + the four call-site wirings.**
Helper in `src/creator/start-weights.js` (or life.js — executor's call, manifest either way);
wire the bardo hometown beat, the life-chain birthplace, and `rollEntry`'s why/foot. Signature
returns the exact `cgLookup`/`rollTbl` envelope. Class absent/unknown → byte-identical to the
unweighted roll (zero-regression path, like `regionBiasedArchetypePool`'s fallback).
*Red-first:* over **N=500 seeded rolls per class**: (a) bard urban-tagged Master Setting starts
≥ **40%** (flat baseline ≈ 20%); (b) ranger `wild` starts ≥ **40%**; (c) **every** row index
appears at least once across the corpus for at least one class AND no row has weight 0 for any
class (reachability = the weights-not-locks law, asserted structurally, not just empirically);
(d) with no class passed, distribution χ² is consistent with uniform. Write (a)–(d) failing first.

**U3 — wilderness-start routing (the §4 rider).**
When the resolved hometown row carries `wild`, set `w.startContext="wild"`, route entry-bundle
contact slots + gazetteer opening Places to wilderness stock, and (if ANIMAL-SOCIAL's API
exists — `typeof`-guarded like every cross-module call in this codebase) seed animal contacts
via it. *Red-first:* jsdom run forcing a wild row → assert `w.startContext==="wild"`, assert
zero tavern/inn-string Places in the opening gazetteer slice, assert the guarded no-op when the
animal layer is absent. *Acceptance:* a forced ranger wild-start hands the DM a payload whose
bundle contains no settlement-interior contacts.

**U4 — spice-neutrality + distribution guard.**
Add to U2's test file: over N=500 per class, the spice-band distribution of weighted Master
Setting picks stays within ±8 percentage points of the authored band shares per band (weighting
buys flavor, not spice). *Red-first* by construction (write against U2 before tuning constants).

**U5 — CG_CLASS-style opening-flavor lines (the §3 prose) + docs registration.**
Twelve 1-line "where your story opens" strings surfaced on the hometown beat's guide plaque
(bardo `guideLine` seam), keyed by class — pure data + one render touch. Register the spec in
`docs/DESIGN.md` + `docs/NEXT-STEPS.md` at the master merge (per worktree discipline, not on
the branch). *Acceptance:* plaque shows the class line for all 12; no layout regression in the
bardo panel.

Dependency order: U1 → U2 → {U3, U4, U5} (U3–U5 independent of each other).

---

## §6 Adam's rulings needed (taste calls — the spec builds either way)

- **R1 — How hard is the lean?** Proposed 4×/2×/1× (archetype opening ≈ 45–60% share).
  Softer (3×/2×/1×) reads as coincidence; harder (6×) starts to feel like a sub-table. Pick a
  ladder — it's one constant.
- **R2 — Does background join the weight?** Proposed: background's top tag at 2× alongside
  class (a Soldier bard leans martial-urban). Or class-only for v1.
- **R3 — Is the lean diegetic?** Should the bardo guide *say* it ("your kind of soul tends to
  wake where the crowds are…") on the hometown beat, or stay silent and let the dice look like
  fate? (U5 assumes a quiet class line; the guide-voice version is louder.)
- **R4 — eStanding stays unweighted?** Spec says yes (standing is fortune). Overrule if you
  want rogues to *earn* "watched, or marked" more often.
- **R5 — Wilderness threshold.** Rider fires only on a `wild`-tagged hometown row (proposed),
  or also when ranger/druid rolls `frontier`?
