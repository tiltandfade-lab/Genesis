---
type: working-note
status: ready-for-session
created: 2026-06-28
related:
  - "[[SPICE-CURVE]]"
  - "[[GENERICIZATION-SCAN]]"
  - "[[TABLE-USAGE-AUDIT]]"
  - "[[DM-CHARTER]]"
  - "_Table Frontmatter Schema"
---

# Genesis — Table Re-Authoring Prep

> **⮕ Superseded framing (2026-06-28):** a recontextualization scan restructured this flat 38-item
> worklist into ordered, two-lane executable actions in **`REAUTHORING-SWEEP-PLAN.md`** (recontext +
> consolidation roughly halves the hand-authoring before any prose). This doc remains the per-table
> **flavor brief** the plan's authoring steps reference; start from the plan for sequencing.

*Synthesis of the full table-corpus scan (six domain scanners + conventions reader + IP-scrub).
This doc exists to make tomorrow afternoon a pure **flavor-writing session** — decisions settled
up front, a top-down worklist, the voice/spice ruler, and the IP leaks to fix in the same edit.*

**The goal:** a re-authoring pass that keeps the world **dynamic, weird, and fun** — and lets it
**get Mythic** where the table_class permits. The corpus is now strongly bimodal: a tier of showcase
d100/d300 tables already meets the bar, and a residue of thin d20 "atom" lookups that feed the
**Fragment oracle** (the 6–10 word sensory line the player actually sees) drag the world back to
beige. We fix the residue, not the whole corpus.

**Headline counts:** ~26 weak tables (9 high / ~11 med / ~6 low) · 2 confirmed IP-leak clusters
(1 file-level FR lore-dump + 1 category-wide creature/race/plane spread, plus 1 product-decision
joke-loot table) · 6 decisions to RESOLVE FIRST. Plus a cheap 28-table stale-band-vocab find/replace.

> **Stop-anywhere rule.** The worklist is sorted highest-leverage first. Work top-down and stop
> whenever the afternoon runs out — every completed row is a permanent win, nothing is left half-done.

---

## 1. RESOLVE FIRST (rubber-stamp or override — ~5 min at the top)

These are the policy calls that, left open, will make two rows inconsistent or waste effort on a
table slated to die. Each has a **recommendation** — accept or override, then write.

| # | Decision | Recommendation (accept / override) |
|---|---|---|
| **D1** | **d20→d100 expansion policy** — which thin tables get a bigger die, how big. | **Make ROW QUALITY the rule, not die size.** Promote to d100 ONLY where the domain is genuinely large AND the table is player-facing/voice_critical (Place History is the model). Rewrite-in-place at the existing die for small-domain or plumbing tables. Expansion targets come from the **worklist below**, not a blanket rule. (NPC Honesty etc. are correctly small bell-curves — leave them.) |
| **D2** | **Backfill Band columns on tables lacking them?** | **Yes — but only on tables you re-author**, as part of the rewrite (honest grading needs reading every row). Do **not** run a context-free "stamp bands everywhere" pass. Untouched tables stay ungraded for now. |
| **D3** | **Voice ceiling — "how weird is too weird"** at Strange/Volatile/Mythic. | **Strange = the world TILTS** (uncanny, still explicable) · **Volatile = reality STRAINS** (consequences escalate, locally) · **Mythic = reality BREAKS** (world-marking, written to the Ledger as canon). "Too weird" = a row that breaks the world's internal seriousness or railroads tone — **NOT** a row that is merely intense. Treat Volatile/Mythic as always-on-but-rare for authoring; defer the paid-tier-unlock question (SPICE-CURVE #3) as a product call. |
| **D4** | **Re-review `player_facing` / `voice_critical` this pass?** | **Opportunistically only** — correct an obvious mislabel on a table you're already editing (it's a one-value change), but don't make it the afternoon's job; it belongs to the fragment-routing / reveal-pacing work. Flag mislabels you spot for that later pass. |
| **D5** | **Wire-vs-retire posture for the ~100 Oracle-only tables** before spending prose on them. | **Decide keep-and-wire vs. retire BEFORE authoring each Oracle-only candidate.** Prioritize tables that are (a) already wired into a generator/procedure, or (b) Oracle-only but committed to wire (the DM-CHARTER §12 flagged drafts: NPC Honesty / Trust Lever, Starting State – World Depth). Don't polish anything slated for retirement. |
| **D6** | **Genericization placeholders vs. fresh prose** (interaction with this pass). | **When a target row contains a Phase-2 placeholder ("the river city", "the Shadow Syndicate", "Heartlander"), replace it with INVENTED concrete sensory specificity in the SAME edit** — don't preserve the dead generic noun. This folds the genericization-finish into the quality pass. Keep SRD-safe tokens (Underdark→ keep only if you mean to; otherwise "the Deeplands"; Shou). |

**~~D7~~ ☑ DONE 2026-06-28 (pre-work):** the ~28-table **stale band-vocab** cohort (`Less-Grounded`/
`Less Grounded` → `Textured`) was swept as one mechanical pass across **28 active files** (all 21 Tarot
cards, Architecture Material, Art Medium, Atmosphere Sounds, Master Setting, Faction – Basic,
Social-taboos, Starting State Pressure); 3 `zz_Archive` snapshots left untouched. Recompiled — 0 stale
vocab in `tables.json`, 0 coverage bugs. The decks are clear; tomorrow's tables already speak the 5-band
vocab.

---

## 2. THE AUTHORING CHECKLIST

Per-table, in order. (Full convention detail in `_Table Frontmatter Schema.md` + `SPICE-CURVE.md`.)

1. **Frontmatter first** — confirm the YAML is lean: `id` (matches the `^block-anchor` EXACTLY — never
   rename), `type`, `domain`, `status: source`, and the three JUDGMENT fields `table_class` /
   `player_facing` / `voice_critical`. **Do NOT** write die / row-count / spice-distribution into
   frontmatter — the compiler derives those from the body. When unsure, `stamp-frontmatter.py` fills
   missing fields idempotently.
2. **Set `table_class` honestly = the spice CEILING.** Spark ≤ Textured (flavor/name tables) · Fork
   ≤ Strange (direction tables) · Commitment may reach Volatile/Mythic (major-consequence only).
   Pick what the CONTENT earns. Current spread is **Fork 204 / Commitment 11 / Spark 32** — **do not
   re-inflate Commitment.**
3. **Body format** = standard pipe table with a Band column: `| dN | Band | Result |`, ranges as
   `lo-hi`. Band values come ONLY from the 5-band ladder: **Grounded / Textured / Strange / Volatile /
   Mythic** (no "Less-Grounded", no "Insane"). Bell-curve tables declare it in the heading,
   e.g. `### One Distinct Object (2d20)`, so the compiler rolls non-uniformly.
4. **Band distribution = honest static rarity by ROW COUNT**, anchored on the canonical d100 weighting
   (1–70 Grounded · 71–90 Textured · 91–98 Strange · 99 Volatile · 100 Mythic) and clamped at the
   class ceiling. State the actual split in a header note (Place History model: "66 G / 20 T / 9 S /
   4 V / 1 M"). Fork stops at Strange; only Commitment places Volatile/Mythic rows.
   (SUPERSEDED 2026-07-06: play distribution is now SPICE-RAISE's tier weights; the authored layout
   survives as coverage.)
5. **Let it get weird** where the class allows. A table that NEVER reaches its permitted ceiling is a
   FLAW (flat-spice). Author the rare high-band rows with **real teeth** — not a slightly-stranger
   Grounded row.
6. **Fragment-oracle sensory standard on EVERY row.** The player sees 6–10 words, so each row must be
   CONCRETE, EVOCATIVE, SENSORY — lead with smell/sound/texture/light/the body before
   sight-and-exposition. No keyword lists, no stubs, no index-entry rows. Bench against Place History
   ("A copper vein; the well water has a metallic tang and the roofs are green with patina") and
   Urban Boon — not against a d20 keyword stub.
7. **Discovery anchor / header note** — a one-line `> **Why this exists**` blurb: what it's for, WHEN
   it's rolled (which procedure/chain triggers it), and the band split. If re-authoring a thin table,
   move originals to a `zz_Archive/` sibling and note "was a dN keyword list; originals in zz_Archive/"
   (the Place History precedent).
8. **5-band sample sanity check (go/no-go gate).** Pull one row from each band the table reaches and
   read them aloud as fragments. If any band's sample is bland or indistinguishable from the band
   below, rewrite before moving on.
9. **Compile last** — `python3 "Engine/00. _System/compile-tables.py" --emit`. Never hand-edit
   `tables.json`/`tables.js`. Resolve flags — especially `starts-high` (malformed header eating row 1,
   or an undeclared bell table needing an `(NdM)` heading). If you touched module wiring, also run
   `python3 build/check-manifest.py`.

### Voice / spice calibration (the ruler)

- **Default register: grim, severe, and hilarious — braided, not one note** (DM-CHARTER §1). Rows may
  be funny or dark, never at the cost of the world's internal seriousness; the joke lives in the
  texture, the stakes stay real.
- **Sensory-first ALWAYS** — smell/sound/texture/light/the body before sight-and-exposition. Every row
  must survive being read as a 6–10 word fragment.
- **Show, don't tell; be funny over literary.** Purple in moderation, then cut. A row that needs two
  clauses to set a mood is usually one clause too long.
- **Author with RANGE** (some warm, some cold, some grim, some absurd) so the DM can match any player
  energy at runtime. Don't make every row the same temperature.
- **High-band rows earn their intensity** (see D3). Going hard at the ceiling is the assignment, not
  the risk. Bench every rewrite against **Place History** + **Urban Boon** — if it's blander, it isn't done.

---

## 3. PRIORITIZED WORKLIST

Sorted **severity → impact**. "Impact" weights voice_critical (feeds the Fragment directly) and
*consumed-by* (a blandness that propagates into generators). Domain tag in brackets. Effort is a rough
afternoon-fraction (S ≈ 20–40 min · M ≈ 1 hr · L ≈ 2 hr+).

### HIGH severity — do these first

| # | Table (path) | Now | Weakness | Target | Eff |
|---|---|---|---|---|---|
| 1 | `…/Dungeons/Urban Lighting.md` **[Urban]** | d50, ~9 distinct outcomes (≈40 copy-pasted) | thin · bland · flat-spice · **voice_critical** | Collapse to honest weighted d12 with a real per-row "Minor Variation" (NO copy-paste), OR keep d50 and write 50 distinct fragments. Let the Uncanny rows actually get weird (light pooling upward; a shadow a half-second behind its caster). | M |
| 2 | `…/Atmospheric & Sensory/Art Depiction.md` **[World]** | d100, but rows ~46–96 are FR lore | bland · mislabeled-class · **IP LEAK** · voice_critical | Rewrite rows ~46–96 as IP-clean world-agnostic depictions; fix the find-replace OCR scars ("the frontier town" mid-sentence, "the great city Wagons"); add the 5-band column so upper rows are genuinely Mythic, not borrowed Realms lore. **(Overlaps IP scrub §5 — do both in one edit.)** | L |
| 3 | `…/Atmospheric & Sensory/Atmosphere Sounds.md` **[World]** | d20, ~12 rows | thin · flat-spice · stale-vocab · **voice_critical** | Expand to d100; migrate "Less-Grounded"→5-band; re-author Grounded rows beyond stock ambience. Prime Fragment feeder for "what does this town sound like." | M |
| 4 | `…/Atmospheric & Sensory/Atmosphere Smells.md` **[World]** | d20, 20 rows, NO Band column | thin · flat-spice · **voice_critical** | Expand toward d100 + add Band column; a town's smell should be able to get uncanny even at Spark→Textured. Current set is the stock fantasy smell-wheel. | M |
| 5 | `…/Architectural Details/Architecture Material.md` **[World]** | d20, 16 G/3 LG/1 S | thin · flat-spice · stale-vocab · **voice_critical** | Expand to d100 + 5-band ladder. ONLY table in the folder — consider seeding siblings (roofline, doorway, age/wear) the way Place Gen grew siblings. | M |
| 6 | `…/Dungeons/Urban Scene.md` **[Urban]** | d20, abstract scene-opener stubs | bland · flat-spice · **voice_critical** | Rewrite all 20 as concrete sensory scene-openers (mine the sibling Urban Segment scene prose); add Band column so 16–20 push past "feels watched" into Strange/Volatile (the door you came through is now a brick wall; the crowd is silent and all facing you). | M |
| 7 | `…/Quests & Problems/Quest Complication.md` **[Social]** | d20, "Label \| abstract effect" | thin · bland · flat-spice | Rewrite as d100 + Band column; each row a thing the player can SEE/HEAR. Plot Item / Plot Lock (d300) sit in the same folder as the exact template. | M |
| 8 | `…/Quests & Problems/Quest Destination.md` **[Social]** | d20, "Place Type \| Reuse Angle" | thin · bland · flat-spice | Expand to d100 + Band; convert place-categories into evocative place-fragments the oracle can surface directly. Read like a Place History sibling. Push the tail to Strange. | M |
| 9 | `…/Quests & Problems/Quest Macguffin.md` **[Social]** | d20, "Needed Thing \| Why Rare" | thin · bland · flat-spice | Promote toward Commitment-grade richness like neighbors Plot Item/Plot Lock; d100 (or feed off plot-item); each a specific, named, sensory object with a concrete reason. | M |
| 10 | `…/Sentient NPCs/NPC Fear.md` **[NPC]** | d20, 20 rows | thin · bland · flat-spice | Banded d100 of concrete scene-ready fears (what the NPC physically does/avoids) — mirrors, being named, a recurring dream. Composes into every NPC the DM voices. | M |
| 11 | `…/Sentient NPCs/NPC Temperament.md` **[NPC]** | d20, overlaps Demeanor | thin · bland · flat-spice | Merge into Demeanor (d100) OR expand to banded d100 of temperaments-as-behavior. "Unsettling" (row 20) wants to be a Strange band, not a footnote. | M |
| 12 | `…/Sentient NPCs/NPC Behavioral Detail.md` **[NPC]** | d20, near-dup of Quirk/Mannerisms | thin · bland · flat-spice · mislabeled-class | Fold into the richer d100s OR rewrite to a banded d100 of specific sensory tics. Rows 16–18 are Strange content in a flat list. | M |
| 13 | `…/Sentient NPCs/NPC Leverage.md` **[NPC]** | d100, faction-jargon | bland · flat-spice | Length is fine; register is wrong. Rewrite each abstract lever ("alliances", "power map") into a tangible specific (a named debt, a letter in a drawer, a key); add Band — high band reaches Strange (knows a true name; holds what the dead want back). | L |
| 14 | `…/Monsters/Monster Motivation.md` **[Wild]** | d20→8 outcomes | thin · bland · flat-spice | True d20/d50 of concrete sensory motivation hooks + Band; reach Strange (guards eggs not its own; feeding a captive thing in the dark; a dead master's last order). **Consumed by Region Encounter row 15 — blandness propagates.** | M |
| 15 | `…/encounters/Tavern Encounters.md` **[Wild]** | d12+d8 (2–20), half one-word stubs | bland · thin · flat-spice | Finish every stub to the scene standard the other half already hits; add a band so a tavern can tilt Strange. **Read straight into narration as a "jolt the scene" beat.** | M |

### MED severity

| # | Table (path) | Now | Weakness | Target | Eff |
|---|---|---|---|---|---|
| 16 | `…/Sentient NPCs/NPC Resource Control.md` **[NPC]** | d100 | bland · flat-spice | Make each resource a specific evocative thing tied to a place/person; Band so top band controls something strange (the only well that still runs; a ferry the drowned won't cross). | M |
| 17 | `…/Sentient NPCs/NPC Under Pressure.md` **[NPC]** | d20, bare verbs | thin · bland · flat-spice | Banded d100 of specific stress behaviors a DM can stage; Strange breaks (laughs wrongly; a voice not theirs). | M |
| 18 | `…/Sentient NPCs/NPC Relationship to Town.md` **[NPC]** | d20, status labels | thin · bland · flat-spice | Toward d50/d100 with concrete standings (owes the miller; banned from the temple; the only one who'll bury the drowned); Band for Strange (the town pretends not to see them). | M |
| 19 | `…/Quests & Problems/Quest Urgency.md` **[Social]** | d20, label pairs | thin · bland · flat-spice | d100 + Band; rewrite into a single concrete clock the player feels ("the well drops a hand's-width a day; in a week the village drinks mud"). Let the tail go Volatile within Fork. | M |
| 20 | `…/Quests & Problems/Quest Questgiver Avoidance.md` **[Social]** | d20, design-doc shorthand | thin · bland · flat-spice | d100 + Band; rewrite each as a line in the questgiver's voice or a vivid one-sentence reason the DM hands over verbatim. Push "The Place Asked Them Not To" to a weird payoff. | M |
| 21 | `…/Factions/Faction - Basic.md` **[Social]** | d100, 27 rows, ad-hoc tiers | flat-spice · mislabeled-class · stale-vocab | **Banding/class fix, not a rewrite** — prose is good. Add `table_class` + `player_facing` to frontmatter; promote to Commitment; re-grade to 5 bands; add real Volatile/Mythic faction rows (a faction unmaking the world, not just "weaving reality from silk"). | S |
| 22 | `…/Monsters/Monster Behavior if Hunted.md` **[Wild]** | d10, flat verbs | thin · bland · flat-spice | d20 + an "Environmental Tell" column (mirror Travel Threat's "Signs of Presence"); push Strange (mimics a hunter's own voice; leaves a "gift" to test them). | M |
| 23 | `…/Travel & Resting/Travel Biome.md` **[Wild]** | d100 = ~5 biomes copy-pasted | thin · bland | Either collapse to an honest weighted d10/d12, OR keep d100 and give each numbered row its own micro-variation so the texture isn't identical 20×. Can never produce a fresh fragment as-is. | M |
| 24 | `…/Travel & Resting/Camp Cooking Complications.md` **[Wild]** | d12, abstract verbs | bland · thin · flat-spice | d20 + sensory tell; reach Strange (the broth shows a face; the smoke bends toward one tent; the salt won't dissolve). | S |
| 25 | `…/Pressure/In-Building Complications.md` **[Wild]** | d20+d6, 5 building types | thin · bland · flat-spice | Per-building d6/d8 columns with concrete sensory beats (or expand the building list); let a row tilt Strange. | M |
| 26 | `…/Dungeons/Dungeon Secret Type.md` **[Dungeon]** | d8, skeleton list | thin · bland · flat-spice | Enrich to d20 with sensory framing + Strange/Volatile/Mythic tail, OR **retire** in favor of the richer sibling Dungeon Secret Tier (which already reaches Mythic). | S |
| 27 | `…/Dungeons/Dungeon Art Motif.md` **[Dungeon]** | d20, terse router | thin · bland · **voice_critical** | Expand to d50 with concrete sensory description (color, scale, texture, what the carving depicts), or add the sensory "Minor Variation" column Lighting/Interactable carry. | M |
| 28 | `…/Dungeons/Urban Sensory.md` **[Urban]** | d50, grammatically uniform | bland · flat-spice · **voice_critical** | Add Band; rewrite the top ~10 into Strange/Volatile hits (a smell of a city you've never been to; sound arriving a beat late; the taste of someone else's memory); vary sentence shape so consecutive rolls don't read as a list. | M |
| 29 | `…/encounters/Region Encounter.md` **[Wild]** | d20 dispatcher | bland · flat-spice | Keep d20 (it's a dispatcher) but rewrite leaf rows into concrete teasers + Band; only literal row 20 reaches up today. | S |
| 30 | `…/Monsters/Monster Meal Viability.md` **[Wild]** | d20→9 outcomes | thin · bland · flat-spice | Fold into Cuisine Effects, OR make rows concrete and weird (the meat keeps twitching as it cooks; edible, but you dream its last hour). | S |

### LOW severity (cheap, do if time remains)

| # | Table (path) | Now | Weakness | Target | Eff |
|---|---|---|---|---|---|
| 31 | `…/World Building/Furniture & Clutter.md` **[World]** | 2× d100 bare nouns | bland · flat-spice · **voice_critical** | Either flag `player_facing: plumbing` so the oracle never surfaces a raw "Stool, high", OR add a small spice-graded "notable clutter" d20 (a chair still rocking; a place set for one). | S |
| 32 | `…/Atmospheric & Sensory/Art Condition.md` **[World]** | d100, Common/Uncommon/Rare | flat-spice | Relabel the Category column to the 5 bands; the Rare rows (Watching/Breathing/Impossible) already ARE Strange/Volatile. | S |
| 33 | `…/Atmospheric & Sensory/Art Medium.md` **[World]** | d100, 3-tier scheme | flat-spice · stale-vocab | Relabel to 5 bands; consider 1–2 Volatile rows if promoted above Spark (Living Loom-Work already brushes uncanny). | S |
| 34 | `…/Starting State/Starting State - World Depth.md` **[World]** | 2× d20, self-flagged draft | thin | Author already wants it widened; expand each d20 to d100, move inline `(band)` notes into a column. Behind-the-screen foreshadowing, so low severity. (DM-CHARTER §12 wire-committed — see D5.) | M |
| 35 | `…/Sentient NPCs/NPC Immediate Mood.md` **[NPC]** | d20 | bland · flat-spice | If kept distinct from Demeanor/Temperament, add Band + a few Strange/Volatile moods; else merge the mood/temperament/demeanor trio. | S |
| 36 | `…/Sentient NPCs/NPC Want.md` **[NPC]** | d20 | bland · flat-spice | Add Band with a handful of uncanny wants (to be forgotten; to undo a specific morning; to feed something); consider d50 for population variety. | S |
| 37 | `…/Items & Rewards/Cuisine Effects.md` **[Wild]** | d12, placeholders | bland · flat-spice | d20 + Band so dungeon food can do something uncanny ("you taste a memory that isn't yours"); replace "DM discretion"/"Effect unknown" stubs. | S |
| 38 | `…/Dungeons/Dungeon Reinforcements.md` **[Dungeon]** | d6, combat-accounting | thin · bland | d12 + sensory/tactical color (how they announce themselves — sound, light, the door they come through). | S |
| — | `…/World Building/Myth Seeds.md` + `Witness Distortion Table.md` **[World]** | d12 / d10 mechanical | bland-for-class | **Judgment call:** these are deliberate mechanical scaffolds. If touched, pair each with an evocative fragment column rather than re-architecting; otherwise leave. | S |

**NOT weak — do not "spice" these** (flagged so the afternoon doesn't waste time): the Place
Generation family (Place History/Secret/Building Interior — now the bar), Plot Item/Plot Lock (d300),
the Urban Segment scene suite, Wilderness Footing/Survival Constraint/Set Dressing, the Mythic
Lenses, Starting State Pressure, the Junk d300 (deliberate weighting + Easter-egg layer), and all the
`voice_critical: false` mechanical routers (loot catalogs, CR/budget tables, Urban Footing, Threat
Identity, Region/Urban/Dungeon Encounter-Type dispatchers). **~~One tidy-up bug~~ ☑ FIXED 2026-06-28
(pre-work):** Urban Encounter Type row 20 had an unclosed `**Complex Scene` bold — closed it.

---

## 4. IP SCRUB (do during the pass)

Fix these in the **same edit** as the row you're re-authoring. Italic `_spell names_` (`_Bane_`,
`_Sleep_`, `_Charm Person_`, `_Water Breathing_`) are SRD/OGL-safe — **NOT** leaks. "Drown/Drowned"
is a common English word — false positive, no action.

### Confirmed — fix now

| File | Term(s) | Replacement |
|---|---|---|
| Art Depiction.md (rows ~46–96) | **The whole FR/Savage-Frontier lore-dump:** Lurue · Ahghairon/Raurlor · Phalorm/Ruardh/Ellatharion/High Forest/Everhorde/Evermeet/Delimbiyran/Dolblunde · Gauntlgrym/Khedrun/Tzindylspar/Thalivar/Southkrypt · Tempus/Kelvin's Cairn · Iniarv/Uthtower/Voaraghamanthar/Ascalhorn | Rewrite wholesale as generic regional epics keeping the MOTIF, dropping every proper noun: "the silver unicorn-spirit of the blue glade"; "an unnamed young court-mage"; "the Three-Crown Alliance"; "the elf-king who fell to the horde"; "the lost underground dwarf-and-men city"; "the war-god / storm-lord"; "a drowned-kingdom lich"; "a great black dragon on flooded ruins". **This is the single highest-priority IP rewrite** (= worklist #2). |
| ~15 files: Wilderness/Urban Contact, Wilderness Art, Dungeon/Urban Enemy Category, Threat Identity, Dungeon Origin, NPC Race Weighted, Place-Secret, Place Mythology, NPC Name Megatable (section labels) | **Category-wide WotC creatures/races/planes:** Tiefling · Drow · Beholder · Mind Flayer/Illithid · Modron · Slaad · Githyanki/Githzerai · Aboleth · Quaggoth · Duergar · Grimlock · Chuul · Intellect Devourer · Underdark · Mechanus · Limbo | Genericize per `GENERICIZATION-SCAN.md`: fiend-blooded · dark-/deep-elf · eye-tyrant / floating-eye horror · brain-eater / tentacled mind-thief · clockwork law-construct · chaos-frog · astral raiders / void-monks · elder deep-thing · the Deeplands/Underdeep · the Clockwork plane / the Churn. (Apply only to the rows you re-author; flag the rest for the genericization finish.) |

### Product decision — DECIDED 2026-06-28 (Adam): keep the content, reskin it diegetically

| File | Direction |
|---|---|
| Dungeon Loot - Outlandish.md (d300) | **Keep the content; do NOT cut.** Rewrite the cross-IP entries as they would be **perceived in a fantasy world** — describe the *thing*, never name the trademark. (A DeLorean = "a horseless silver chariot with gull-wings, its runes lit only when it runs fast enough"; the player who thinks about it gets the joke — cooler than "you found the DeLorean," and it **also neutralizes the trademark-name IP risk**, so this folds the IP fix into the reskin.) Strip the literal Origin-column citations (Bane's Mask / Light-Saber / Blue Shell → diegetic descriptions). **Pairs with a new backlog item: author ANACHRONISM-INTRUSION HOOKS** so this tier of loot has narrative grounding (the classic "a vessel from elsewhere crashed into the world" — to be explored). This becomes a re-authoring target (the Origin column) + a design item (the hooks), not a cut. |

### Maybe / leave-as-is

- NPC Name Megatable surnames (Mystralath, Goblinbane, Trueanvil) read as generic coinages — **keep**;
  only the "Tiefling Female/Male/Virtue Names" section LABELS need relabel → "Fiend-blooded Names."
- `zz_Archive/This Is Your Life (XGE heritage).md` names XGE + tiefling/drow — **leave**; archived,
  not-compiled, not-mirrored, frontmatter already declares it personal-reference only.

---

## 5. THE BAR (emulate these)

When a row feels thin, open one of these and match it.

| Domain | Exemplar | Why it's the bar |
|---|---|---|
| World Building | **Place History.md** (d100) | The named exemplar — 100 unique evocative origins, honest band curve. |
| World Building | **Building Interior.md** (d300) | 3-column layout/feature/occupant; every Grounded row carries a quiet hook. The new bar. |
| World Building | **Place-Secret.md** (d200) | ~25% creature-typed; Grounded rows are full mini-scenarios. |
| World Building | **Myth Costs.md** (d100) | Rebuilt thin-stub → 100 rows; Strange/Volatile genuinely escalate ("The Retroactive Author"). |
| Social | **Plot Item.md / Plot Lock.md** (d300) | Full 5-band grading, IP-clean prose, real Grounded→Mythic escalation. Among the best in the corpus. |
| NPC | **NPC Personality Trait / Visual Quirk / Demeanor / Mannerisms** (d100) | Vivid, concrete, performable; the in-domain bar — the four small d20 atoms should read like these. |
| Dungeons | **Urban Boon.md** (Fork d20) | The named exemplar — every row an evocative hook + concrete mechanical benefit; row 20 reaches Mythic. |
| Dungeons | **Dungeon Problem / Discovery Form / Lighting / Interactable Object** | Two-bypass obstacles; sensory grading with honest Strange/Mythic tails. |
| Urban | **Urban Segment * Scene family** (Cold/Hot/Warm/Event/Faction) | d20s with full Description + d4 Transition columns climbing to Mythic ("Wound in the World's Skin"). |
| Wilderness | **Wilderness Survival Constraint / Footing (d200) / Sensory** | Multi-column, mechanically grounded, fragment-ready. |
| Consequences | **Mythic Success/Failure Lenses** + **Starting State Pressure** (d100) | Correct Commitment ceiling; every row a named concrete hook. |

---

*When done: recompile (`compile-tables.py --emit`), resolve any `starts-high` flags, and if any module
wiring changed run `check-manifest.py`. Update `NEXT-STEPS.md` + the Cowork auto-memory in the same change.*
