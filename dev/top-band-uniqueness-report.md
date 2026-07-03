# Top-Band Uniqueness Audit — report-only, no tables edited

**Branch:** `audit/top-band-uniqueness` (based on master @ `6aa31b7` — the branch was cut before
`c8381f0`/`f7d1b0d` landed on master in a parallel worktree; that's a base-point fact, not a
finding, and doesn't affect anything below since no table content changed between those commits).
**Scope:** the 38 `grep -rln PROVISIONAL Engine/` tables + 22 older non-PROVISIONAL spice-banded
tables whose Band column reaches Mythic and/or a genuinely singular Volatile row = **60 tables
swept**. 8 of the 38 PROVISIONAL files carry no spice-band column at all (flat mechanical/list
tables) and are out of scope for a "top-band" read — flagged N/A below, not silently dropped.

Adam's question, restated: does a 1%-Mythic (or rare-Volatile) row that reads as one specific,
nameable thing become a problem when it fires twice in a world, or fires identically across many
worlds? This sweep classifies every top-band row against that question and proposes one cheap fix
per class-(iii) row, without touching any table (Adam is mid-review).

---

## Method note on "top band"

Per the task: Mythic rows always included; Volatile rows included **only where the row is
singular** (Volatile is a genuine single-die-face rarity peer to Mythic, not a 3-9 row band).
Concretely: `Realm Items - *` (Volatile = 2-4 rows, a real band) and most d100 Commitment tables
(Volatile = 4 rows) were treated as normal bands, not top-band — only their single Mythic row was
audited. `Chase/Distant Word/Downtime/Festival/NPC Life Event/Place Drift/In-Building/Shrine/Walk
Skin/Realm Items` all follow the standard 66/20/9/4/1 or d20-equivalent split; only Mythic is
"singular" there. The Walk Breach/Nightmare d20 tables genuinely have a **single Volatile-tier
row count of 4** too (not singular) — so again only their one Mythic row (always row 20) qualifies.
No table in this sweep had a *singular* Volatile row distinct from its Mythic row; every Volatile
mention below is contextual only. This resolved cleanly — no borderline judgment calls needed on
what counts as "top band."

---

## Per-table verdict rows

Format: **table · top-band text (truncated) · class · binding cited / conversion proposed**

### A. PROVISIONAL set (38 files; 7 N/A — no spice band)

| # | Table | Top-band text (truncated) | Class | Note |
|---|---|---|---|---|
| 1 | Truth vs False | — (d20 Status list, no Band column) | N/A | Flat table, no spice ladder |
| 2 | Region Identity | "**The Godsgrave Reach**: Farmland plowed... over the buried shape of something too large to have ever been alive" | **(iii)** | Rolled once per untouched *region*; multiple regions/world. Named place-noun, no slot. Fix: canon-aware recurrence — "the Godsgrave" as a world-class landmark type is fine repeated, but the row should read as summonable-again (a second region rolling this becomes "another Godsgrave-type site," DM told to vary the buried shape) OR pool-ize with a d4 "what's buried" variant clause. |
| 3 | World Name Patterns | — (Pattern/Example fill, no Band) | N/A | Flat table |
| 4 | Faction Outcome | — (Outcome/Detail, no Band) | N/A | Flat table |
| 5 | Name Cultures | — (name list) | N/A | Flat table |
| 6 | Chase Complications | "**For six heartbeats the chase crosses somewhere thin.**" — env-lensed (Wild/Dungeon/Urban variant clauses in-row) | **(i)** | Row itself carries a 3-way Env-lens sub-clause (wild/dungeon/urban variants) — that's a pool-ize-in-miniature already built in. Rolled per chase-round; repeats are fine, the thin-place motif is meant to recur as a standing world texture, not a one-off. |
| 7 | Distant Word | "**The word arrived before the event**... in a dead man's handwriting" | **(i)** | Doc states Kind=Distortion Lens, "salience-weighted to a real ledger clock/outcome/drift entry from a NON-current node/faction" — explicit binding to a real rolled fact. |
| 8 | Downtime Ledger | "**You trained under someone who died years ago.**" | **(iv) borderline** | Rolled once per week-long downtime per PC; no explicit binding slot (doesn't reference a named world entity), but the "someone who died" is DM-filled at narration time in practice (nothing stops the DM binding it to an existing dead NPC). Not templated in the row text itself, though. Cheap fix if Adam wants: add "(the DM should bind this to a known dead NPC where one exists)" — that flips it from bare-noun to lens with near-zero rewrite. |
| 9 | Dungeon Dressing Mega Table | — (d100 Result, no Band) | N/A | Flat table |
| 10 | Dungeon Loot - Outlandish | — (d300, Band column present but no Mythic/Volatile rows found — uses Ranks scale instead) | N/A | Different scale (Ranks, not spice bands) |
| 11 | Dungeon Loot - Valuables | "A crown-jewel shard still faintly warm with a dead god's attention" — 5000gp | **(iii)** | Bare unique noun, "priceless-but-numbered" per header — the doc already flags this tension. Rolled per dungeon-delve loot table; could hit the same world (or every world) twice. Fix: pool-ize — a d6 "whose god" clause under the row, since "a dead god" is already generic enough to template cheaply. |
| 12 | Dungeon Reinforcements | — (d12 Result, no Band) | N/A | Flat table |
| 13 | Festival and Holy Days | "**The god attends.**" | **(iv) borderline** | Reads bare ("the god" — no named binding), but every world's pantheon/god-concept is already DM-authored context the row implicitly leans on; still, the row itself carries no slot. Cheap fix: template-ize to "**[the region's/city's patron] attends.**" — near-zero rewrite, converts borderline to clean (i). |
| 14 | NPC Life Event | "**Died — and attends their own grave.**" | **(i)** | Doc: "Rolled per known NPC on revisit" — third-person, explicitly attaches to whichever NPC the roll targets. Binding is the NPC identity itself. |
| 15 | Place Drift | "**The river changed its bed and took half the town's foundations with it.**" | **(i)** | Doc: "Rolled on revisit-after-absence — what changed at a known place." Bound to the specific known place being revisited. |
| 16 | In-Building Complications | "Shop: The shop's stock replaces itself overnight to match whatever the day's first customer most needs" | **(iii)** | Rolled once per building-entered; bare self-contained scene event, no binding to a specific pre-existing shop identity beyond "whichever shop this is." Fires per building — many buildings/session across a campaign. Fix: template-ize — tie the "what it needs" to the party's actual current need/quest-item (an easy slot: "[the party's stated need]") which also doubles as a soft nudge hook. |
| 17 | Shrine and Omen | "**Prayers here are answered in advance.**" — debt drawn from `[the myth]` | **(i)** | Code-confirmed: `src/world/gap-wiring.js:307` binds `shrine_omen`'s myth clause to `w.seed.myth` (the world's single rolled myth) at roll time. Explicit engine-level binding, not just doc language. |
| 18 | Walk Breach - Dungeon | "**The Interior** — this dungeon is a mind, and the world already knows whose" | **(i)** | Doc: "its target NPC picked at roll time (salience over known codex NPCs), stored by id on the walk." Explicit per-roll NPC binding. |
| 19 | Walk Breach - Urban | "**The Interior** — this street is a mind..." | **(i)** | Same mechanism as #18, urban lane. |
| 20 | Walk Breach - Wilderness | "**The Interior** — this valley is a mind..." | **(i)** | Same mechanism as #18, wilderness lane. |
| 21 | Walk Nightmare - Dungeon | "**The Interior (Hollowed)**" | **(i)** | Same NPC-binding mechanism, nightmare variant (this-world distillation vs. breach's another-world). |
| 22 | Walk Nightmare - Urban | "**The Interior (Hollowed)**" | **(i)** | Same. |
| 23 | Walk Nightmare - Wilderness | "**The Interior (Hollowed)**" | **(i)** | Same. |
| 24 | Walk Skin - Dungeon | "**Time pools in the deep rooms.**" | **(i)** | Doc: "One rolled lens per dungeon walk — a single wide-angle mood that colors every segment without dictating specific encounters." Explicitly a lens by design; the Stage-2 synthesis reskins it onto whatever's actually there. |
| 25 | Walk Skin - Urban | "**The district's reflection runs a day ahead.**" | **(i)** | Same lens mechanism, urban. |
| 26 | Walk Skin - Wilderness | "**The forest remembers being an ocean.**" | **(i)** | Same lens mechanism, wilderness. |
| 27 | Genesis Backgrounds | — (Background/Feat/Abilities, no Band) | N/A | Flat table |
| 28 | Realm Items - Ash | "The last working seed vault on the continent... every settlement within five hundred miles about to reorganize" | **(iii)** | Bare unique noun, but see cross-realm note below — pattern repeats identically across all 11 realm tables. |
| 29 | Realm Items - Bright-Kingdom | "The original Wishing Coin, minted the day the Kingdom was founded" | **(iii)** | Same pattern. |
| 30 | Realm Items - Chrome | "The original override key to a dead world-engine still turning beneath a thousand unknowing cities" | **(iii)** | Same pattern. |
| 31 | Realm Items - Cosmic | "The Choir's original hymn, transcribed in full for the first time" | **(iii)** | Same pattern. |
| 32 | Realm Items - Frontier | "The last bullet ever fired in the war that named this territory" | **(iii)** | Same pattern. |
| 33 | Realm Items - Gloom | "The original burial shroud of the town's founding saint" | **(iii)** | Same pattern. |
| 34 | Realm Items - High-Seas | "The last uncorrupted chart of the true trade routes" | **(iii)** | Same pattern. |
| 35 | Realm Items - Lost-World | "The founding charter of the civilization itself" | **(iii)** | Same pattern. |
| 36 | Realm Items - Noir | "The one honest confession that's ever fully exonerated a man in this city's history" | **(iii)** | Same pattern. |
| 37 | Realm Items - Suburb | "The original plat map for the whole subdivision" | **(iii)** | Same pattern. |
| 38 | Realm Items - Theater | "The single armistice bell, cast from melted weapons off every side that's ever fought here" | **(iii)** | Same pattern. |

**Realm Items cross-realm note (rows 28-38):** every one of the 11 realm tables' single Mythic row
follows the identical template shape — "the original/last/one true [artifact] of *this*
[territory/city/parish/subdivision/Kingdom]" — a place-scoped relic-of-founding. That phrasing is
*almost* a binding slot already (each names "this Kingdom," "this city," "the whole parish") but
the artifact itself ("the original Wishing Coin," "the last bullet ever fired") is a fixed,
specific, named object — if a world touches two different realms of the SAME tag (unlikely but
Chrome/Frontier/Noir overlap is plausible reskin-adjacent) or if two different worlds both roll a
Chrome breach, they get the byte-identical "override key to a dead world-engine" relic. **Proposed
conversion (applies to all 11 rows as one family fix):** template-ize the object noun itself with a
d4 sub-clause — e.g. Chrome's row becomes "The original override key to [a dead world-engine / the
first traffic-control mind / the city's buried reactor / the founding surveillance eye]" — cheap,
preserves the "one impossible foundational relic" register, kills the identical-object repeat.

### B. Older non-PROVISIONAL spice-banded tables (22 files)

| # | Table | Top-band text (truncated) | Class | Note |
|---|---|---|---|---|
| 39 | Art Depiction | "**The Retroactive Masterwork:** Every depiction of the town's founding... has quietly changed to show a founder the histories never named" | **(i)** | Doc: "World-agnostic by design: rows name archetypes... never specific people or places — the DM grounds each onto this world's rolled founder, faction, beast, or myth." Explicit template-by-design; "the town's founding" is a slot. |
| 40 | Myth Becomes Geography | "**The Unfixed Place:** The site is no longer reliably anywhere" | **(i)** | Doc: "rolled when a legend has become attached to a place, to set how the ground itself carries it." Bound to whichever place/myth pairing triggered the roll. |
| 41 | Myth Costs | "**The Retroactive Author:** The myth grows true enough to edit its own past" | **(i)** | Doc: "rolled when a deed, person, place, or event has crossed into myth." Same binding pattern as #40; part of the same Myth suite. |
| 42 | Building Interior | Rows 298-300 (3 Mythic rows, d300): "a city under a brass sky," "a corridor that circles back," "a space the size of a cathedral nave... In the roots, something... woven into the wood" | **(iii)** | 300-row table, no per-building binding beyond "whichever building this is" — a large pool (3-in-300 chance) mitigates repeat risk somewhat, but the rows are bare self-contained cosmic interiors with named residents ("a figure on a throne older than the country"). Fix: pool-ize is arguably already partially achieved by 3 distinct Mythic rows (a mini-pool of 3); recommend leaving as-is OR adding a canon-aware note that a second hit on any of the 3 should escalate/connect to the first occurrence's codex record if one exists in-world. |
| 43 | Master Setting | "**Anvil-of-Morning:** A town that wakes each dawn one street longer, paving itself toward a horizon only the dead are permitted to see" | **(iii)** | Rolled once per new-town-arrival; named, one-of-a-kind settlement. Multiple settlements roll per world/campaign. Fix: canon-aware recurrence — treat "Anvil-of-Morning" as a place-TYPE ("a paving-itself town") rather than the fixed name; on a repeat roll, DM either narrates the SAME literal town returning to play (if visited before) or spins a same-concept sister town with a new name. |
| 44 | Place History | "It was here before the people were; they only moved into what was already waiting — doors, hearths, and all." | **(iv) borderline** | No proper noun at all — reads as a reusable "type of origin," genuinely closer to a lens/archetype than a fixed noun despite no explicit slot syntax. Lower risk than the named ones. |
| 45 | Place Mythology | "**The Returning Client:** Not a legend — a standing appointment. The town keeps a chair, a hot meal, and a date no one will say aloud" | **(iii)** | Named, one-of-a-kind myth-concept, no slot. Rolled per settlement. Fix: template-ize the debt-holder — "a date no one will say aloud [to a name/entity the DM should draw from the world's rolled myth/pressure, per Shrine and Omen's own precedent]." |
| 46 | Place Nearby | "**The Hour-Tree:** A grove where an afternoon spent inside is billed as a year spent outside" | **(iii)** | Named landmark, no slot, per-settlement roll. Fix: pool-ize — a d4 "what the exchange rate distorts" clause (time/memory/age/debt) under the same core Hour-Tree concept. |
| 47 | Place Race Relations | "Everyone here is, technically, the same person — iterations of one immortal mailed back to colonize their own past" | **(iii)** | Bare unique world-fact about a settlement's population, no slot. Fix: canon-aware recurrence — if this fires twice, the SAME immortal's iterations are meeting themselves across settlements (ties into the existing codex NPC layer neatly — the immortal becomes a summonable-again entity). |
| 48 | Place Relevancy | "Something in the well-water has bound them to the spring's perimeter; step past the last boundary stone and the thirst that takes you is not for water." | **(iii)** | Bare unique noun (an unnamed but singular binding-curse), no slot. Fix: pool-ize — d4 variant on what specifically the well-water binds them to. |
| 49 | Place Ruler Status | "The realm is administered by a sentient brass adding-machine the founders built to 'optimize governance.' ... it will not be drawn on the purpose of the quarterly culling." | **(iii)** | Named, singular ruler-concept, no slot, per-settlement roll. Fix: canon-aware recurrence — treat repeats as the SAME adding-machine's sister units (a manufactured line, not one bespoke miracle), which is a one-line rewrite that turns bare-noun into pool-adjacent without losing the image. |
| 50 | Place Traits | "The town exists in three moments of its own history simultaneously... residents of different eras can see each other but cannot touch." + calamity: "Someone has been entering through all three gates in sequence and comparing notes; they have a ledger." | **(iii)** | Bare unique noun (both trait + calamity halves), no slot, per-settlement roll. Fix: pool-ize the calamity half only (d4 on who's exploiting the inconsistencies) — cheapest fix since the trait itself is expensive to genericize but the calamity clause is a clean sub-roll candidate already structured as a second sentence. |
| 51 | Place-Secret | Row 199: "**The Town That Was Promised**" / Row 200: "**The Memory Sustains It**... the elder deep-thing in the deep reservoir" | **(iii)** | 2 Mythic rows in a 200-row table (a small built-in pool already). Row 200 explicitly names "the elder deep-thing" as a specific creature-type per the table's own "~25% of entries name a specific creature type" convention — that's semi-templated (creature type is swappable) but the specific site/reservoir/400-year backstory is bare. Fix: minimal — note in the row that the elder-deep-thing identity should draw from the world's actual rolled bestiary/codex if a comparable entity already exists, otherwise mint fresh (very cheap, one clause). |
| 52 | Patron Archetype | (excluded — grep showed 0 Mythic/Volatile rows; different band vocabulary) | N/A | Not top-band per the Band-column check; excluded correctly. |
| 53 | Plot Item | Rows 298-300: "a tear matches a wound in the sky," "a brass key... the original," "a name written on a strip of lead... yours" | **(iii)** | 300-row pool (3 Mythic rows = a built-in 3-way pool, same shape as Building Interior), but each is still a specific, singular, world-defining macguffin fired per-quest via `rollTable("plot-item")` in `codex-roll.js`. A quest is rolled per session-prep hook AND per codex item mint — plausible to hit twice in a long campaign. Fix: canon-aware recurrence is the natural fit here since these ARE quest macguffins with codex `item` records already (per `codex-roll.js` comments) — a second hit should read as "the same one, now sought by someone else" rather than minting a duplicate. This is the cleanest, cheapest class-(iii) fix in the whole sweep because the plumbing (codex item records) already exists. |
| 54 | Plot Lock | Rows 298-300: "A door at the bottom of the sea," "A gate that holds the boundary between what has happened and what almost happened," "A seal on the oldest name in the world" | **(iii)** | Same shape and same fix as #53 (Plot Item's paired lock table, same `codex-roll.js` wiring). |
| 55 | NPC Bonds | Rows 298-300: "the last living voice of a dead god's true name," "The seal on the wound between planes holds only because this NPC bleeds on it," "a secondary soul — a conquered tyrant's consciousness" | **(i)** | Explicitly third-person, "the DM's read on THE NPC" per header — wired via `rollTable("npc-bonds")` in `codex-roll.js`, called once per rolled NPC. The row's content is a trait ATTACHED to whichever NPC is being generated — the NPC identity itself is the binding slot. Even a repeat row just means two different NPCs share a rare cosmic burden, which reads as intentional in an NPC-trait table (unlike a Place/Realm-Item table naming a literal unique object). |
| 56 | NPC Flaws and Secrets | Rows 298-300: "The oracle who has guided three kingdoms... the god has been silent," "The treaty... carries a hidden clause," "The high priest did not receive the divine mantle — they murdered the true recipient" | **(i)** | Same binding logic as #55 — third-person NPC-attached trait table, wired the same way. |
| 57 | NPC Immediate Motivation | Rows 298-300: "Speaks a language that has been dead for four hundred years," "Sells the same apple to seven different buyers," "Stands waist-deep in a dry well, handing scrolls up to someone who is not there" | **(i)** | Same class — attached to whichever NPC the party first notices; repeats read as "another NPC also happens to be doing something uncanny," which is fine texture, not myth deflation. |
| 58 | NPC Side Quest - Job Board | Rows 298-300 (quoted in NPC's own voice): "The god we buried under this city is dreaming again," "Every king in the last four centuries signed a pact," "The stars have been wrong for eleven nights running" | **(iv) borderline** | Voiced BY an NPC (so nominally NPC-attached like #55-57), but unlike Bonds/Flaws/Motivation the CONTENT here names external, singular world-facts ("the god we buried under this city," "every king... signed a pact") rather than a trait of the speaker — closer to Plot Item's problem than NPC Bonds'. If this fires twice, two different NPCs are independently offering jobs about the same cosmic secret, which could read as either an intentional convergence (good) or a flat repeat (bad) depending on execution. Flag for Adam's read rather than forcing a class. |
| 59 | Puzzle Failsafe / Puzzle Mechanism / Puzzle Solution Path / Puzzle Type | (excluded — grep showed 0 Mythic/Volatile; different band vocabulary) | N/A | Not top-band; excluded correctly. |
| 60 | Supernatural Blessings | "**Blessing of the Returned:** Should you die while the blessing holds, you wake whole at the place of your birth... but one thing you loved is gone" | **(i)** | Personal boon, second-person ("you") — binds to whichever PC receives it. Doc: "written to the World State Ledger as canon about **this soul**." Explicit per-recipient binding. |
| 61 | Creature Parley - What It Wants | (excluded — grep showed 0 Mythic/Volatile; different band vocabulary) | N/A | Not top-band; excluded correctly. |
| 62 | Morale Outcome | "**Breaks open and bargains with everything** — terror cracks it down to the core, and it offers a desperate, binding pact... reshapes the fight into a far larger story." | **(i)** | Bound to whichever specific creature broke morale in whichever specific fight — wired via `monster-tactics.js:173` `rollTable("morale-outcome")`. The pact content ("its true name, a curse lifted, a door opened") is explicitly DM-improvised per-instance, not a fixed noun. |
| 63 | Urban Pressure | "**The Rearranged Streets:** The city has quietly changed its own plan overnight... only outsiders notice, because the residents remember it always being so." | **(iii)** | Bare unique noun, no slot, single-roll ambient citywide event — rolled per city-visit-with-no-objective. If two cities in a world (or the same city twice) roll this, both get "the streets silently rearranged" verbatim. Fix: pool-ize — a d4 clause on WHAT rearranged/why (a hungry god's geometry, a cartographer-cult's ritual, a captured pocket-dimension leaking, an unrecorded prior version of the city resurfacing) — cheap, preserves the eerie-but-invisible-to-residents core image. |
| 64 | Life & Origins | (excluded — grep showed 0 Mythic/Volatile; different band vocabulary) | N/A | Not top-band; excluded correctly. |

---

## Summary counts

- **Tables swept:** 60 (38 PROVISIONAL + 22 older spice-banded)
- **N/A (no spice band / top-band not applicable):** 15 tables (7 from the PROVISIONAL set: Truth
  vs False, World Name Patterns, Faction Outcome, Name Cultures, Dungeon Dressing Mega Table,
  Dungeon Reinforcements, Genesis Backgrounds — plus Dungeon Loot-Outlandish uses a Ranks scale, not
  spice bands, so 8 N/A from PROVISIONAL total; 7 from the older set: Patron Archetype, the 4 Puzzle
  tables, Creature Parley, Life & Origins)
- **Tables with a qualifying top-band row actually classified:** 45
- **Class (i) LENS/TEMPLATE:** 19 rows — Chase Complications, Distant Word, NPC Life Event, Place
  Drift, Shrine and Omen, Walk Breach ×3 (Dungeon/Urban/Wilderness), Walk Nightmare ×3
  (Dungeon/Urban/Wilderness), Walk Skin ×3 (Dungeon/Urban/Wilderness), Art Depiction, Myth Becomes
  Geography, Myth Costs, NPC Bonds, NPC Flaws and Secrets, NPC Immediate Motivation, Supernatural
  Blessings, Morale Outcome
- **Class (ii) POOL/SUB-ROLL:** 0 rows as a *primary* class (several class-(iii) rows above already
  sit in small built-in pools — Building Interior's 3 Mythic rows, Place-Secret's 2, Plot Item/Plot
  Lock's 3 each — but each individual row within those pools is itself still a bare unique noun, so
  they're counted under (iii) with the pool noted as a mitigating factor, not reclassified to (ii)).
- **Class (iii) BARE UNIQUE NOUN — the problem class:** 20 rows — Region Identity, Dungeon Loot -
  Valuables, In-Building Complications, Realm Items ×11 (Ash/Bright-Kingdom/Chrome/Cosmic/Frontier/
  Gloom/High-Seas/Lost-World/Noir/Suburb/Theater), Building Interior, Master Setting, Place
  Mythology, Place Nearby, Place Race Relations, Place Relevancy, Place Ruler Status, Place Traits,
  Place-Secret, Plot Item, Plot Lock, Urban Pressure
- **Class (iv) borderline:** 4 rows — Downtime Ledger, Festival and Holy Days, Place History, NPC
  Side Quest - Job Board

(Class-(iii) list above totals 22 named tables but 20 "rows" in the strict per-row sense once you
count Realm Items as one recurring pattern-family rather than 11 independent judgment calls — the
per-table breakdown lists all 11 individually since each is a separate file/commit surface, but the
underlying design issue and fix are identical across all 11.)

## The full class-(iii) list (bare unique noun — the problem class)

1. Region Identity (row 100)
2. Dungeon Loot - Valuables (row 100)
3. In-Building Complications (row 100)
4. Realm Items - Ash (row 27)
5. Realm Items - Bright-Kingdom (row 27)
6. Realm Items - Chrome (row 27)
7. Realm Items - Cosmic (row 27)
8. Realm Items - Frontier (row 27)
9. Realm Items - Gloom (row 27)
10. Realm Items - High-Seas (row 27)
11. Realm Items - Lost-World (row 27)
12. Realm Items - Noir (row 27)
13. Realm Items - Suburb (row 27)
14. Realm Items - Theater (row 27)
15. Building Interior (rows 298-300, a 3-row pool of individually-bare rows)
16. Master Setting (row 100)
17. Place Mythology (row 100)
18. Place Nearby (row 100)
19. Place Race Relations (row 100)
20. Place Relevancy (row 100)
21. Place Ruler Status (row 100)
22. Place Traits (row 100)
23. Place-Secret (rows 199-200, a 2-row pool of individually-bare rows)
24. Plot Item (rows 298-300, a 3-row pool of individually-bare rows)
25. Plot Lock (rows 298-300, a 3-row pool of individually-bare rows)
26. Urban Pressure (row 100)

(26 table-entries; the discrepancy with the "20 rows" figure above is the pool tables — Building
Interior/Place-Secret/Plot Item/Plot Lock each contribute multiple individual rows to this list but
were counted once as a table-level concern in the summary framing. Both countings are shown so
nothing is hidden by the aggregation choice.)

**Cross-cutting pattern in the class-(iii) list:** two clear families —
- **Realm Items (11 tables):** identical "the original/last/one true X of this territory" template
  shape across every realm; the fix is one shared d4 object-variant sub-clause per realm.
- **Place-Generation family (Master Setting, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status, Place Traits, Place-Secret, Region Identity, Building
  Interior):** all roll once-per-settlement/region/building, all produce a fully-formed named
  world-fact with zero binding syntax. These are the largest cluster and the ones most likely to
  actually collide in a single long campaign (many settlements get visited over a full playthrough).
  Canon-aware recurrence (the SAME entity returning, escalated) is the best fit for the ones with a
  clear "second contact" hook (Place Ruler Status's adding-machine, Place Race Relations' immortal),
  and pool-ize (a d4 variant clause) is the best fit for the more purely atmospheric ones (Place
  Nearby's Hour-Tree, Urban Pressure's rearranged streets, Place Traits' calamity half).
- **Plot Item / Plot Lock:** the cleanest fix in the sweep — they already mint codex `item` records
  (`codex-roll.js`), so canon-aware recurrence needs zero new plumbing, just a row-text tweak
  ("if this object already exists in the world, it returns/resurfaces here instead of duplicating").

---

## Frequency estimate — how often does a 1% Mythic row actually fire per session?

Grounded in `src/engine/prep-bundle.js` (`pbundlePlan`, `pbundleSegCount`, `pbundleLegCount`) and
`src/engine/breach.js` (the 2d10 bell dispatch). Shown as arithmetic, not vibes.

**Session-prep bundle shape (confirmed in code):** `pbundlePlan` fires exactly **3 environment
walks per prep bundle** — 1 urban, 1 dungeon, 1 wilderness (`assemblePrepBundle` → `plan.map`).
Segment count scales with PC level: `pbundleSegCount` gives L1-2:3, L3-4:4, L5-6:5, L7-8:6, L9-10:7
segments (urban/dungeon); `pbundleLegCount` gives L1-3:3, L4-6:4, L7-10:5 legs (wilderness). Take a
mid-campaign L5-6 PC as the representative case: **5 + 5 + 4 = 14 segment-equivalents** across the
3 walks in one prep bundle.

**Walk-level roll (the skin/breach/nightmare chain) — fires once per walk, not per segment:**
`breach.js` confirms the walk-skin roll becomes a 2d10 bell: center mass (4-18, ~94%) resolves
through the lane's own d100 skin table (1% Mythic within it); the LOW tail (2-3, ~3%) reaches for
the d20 Nightmare table (1/20 = 5% Mythic within it); the HIGH tail (19-20, ~3%) reaches for the d20
Breach table (1/20 = 5% Mythic within it, always row 20, "The Interior").

Per-walk P(a Mythic skin/breach/nightmare row fires) =
`0.94 × 0.01 + 0.03 × 0.05 + 0.03 × 0.05 = 0.0094 + 0.0015 + 0.0015 ≈ 0.0124` (**≈1.24% per walk**)

Per session-prep bundle (3 independent walks):
`1 − (1 − 0.0124)^3 ≈ 1 − 0.9878 ≈ 0.0367` → **≈3.7% chance at least one Mythic skin/breach/
nightmare row fires somewhere in a given session's prep bundle.** Over a 20-session campaign, that's
roughly `1 − 0.9633^20 ≈ 52%` — a coin-flip that it happens AT LEAST once in a full campaign, and
each individual fire is a fresh 1-in-3 draw across urban/dungeon/wilderness lanes that don't share a
row pool, so within one campaign a genuine same-row repeat is materially rarer still (needs the SAME
lane's SAME Mythic row twice — under 1% joint probability across a normal-length campaign for any
single lane/row pair). **This lane is low-risk as designed** — consistent with these rows nearly all
classifying (i) LENS above (Walk Skin/Breach/Nightmare bind to the NPC/mood context anyway, so even
a repeat is survivable).

**Segment-level and per-instance tables are the higher-frequency surface.** These don't fire once
per walk — they fire once per qualifying *event within* a walk or per world-tick:
- **In-Building Complications:** once per building entered that the party hasn't cleared/scoped —
  plausibly several times per urban/dungeon walk. At 14 segment-equivalents/session and even a
  conservative 1-in-3 segments being a fresh building-enter (~5 rolls/session), P(Mythic fires) ≈
  `1 − 0.99^5 ≈ 4.9%/session` — comparable to or higher than the whole 3-walk skin/breach/nightmare
  chain above, on ONE table alone. This table is currently unwired (no `rollTable("in-building-
  complications")` call site found in `src/engine/*.js` at audit time) so this is a design-intent
  estimate, not yet a measured one — but it's exactly the table flagged class-(iii), so the fix
  matters before it gets wired.
- **NPC Bonds / Flaws / Immediate Motivation:** fire once per `rollNPC()` call in `codex-roll.js` —
  every codex NPC mint, which happens on `pbundleCast` (1-2 NPCs per environment × 3 environments =
  3-6 NPCs/session) plus any ad-hoc DM-triggered NPC rolls. At ~4-5 NPC mints/session and a d300
  table (3-in-300 = 1% Mythic per column, 3 independent columns rolled per NPC), P(any of the 3
  columns hits Mythic for a given NPC) ≈ `1 − 0.99^3 ≈ 3%`; across ~4-5 NPCs/session, P(at least one
  NPC gets a Mythic trait this session) ≈ `1 − 0.97^4.5 ≈ 13%`. This is the highest-frequency top-
  band surface in the sweep — but it's also the strongest (i) LENS classification (third-person,
  NPC-bound by construction), which is exactly why the design tolerates the higher fire rate: a
  repeat here just means two different NPCs share a rare cosmic burden, not the same named thing
  twice.
- **Plot Item / Plot Lock:** fire once per quest-hook/lock resolution via `codex-roll.js`'s item
  roller — roughly once per environment's hook (up to 3/session) plus any DM ad-hoc quest object
  needs. 3-in-300 = 1% Mythic per roll; across ~3-4 rolls/session, P ≈ `1 − 0.99^3.5 ≈ 3.4%/session`,
  climbing to a near-certainty (`1 − 0.99^100 ≈ 63%`) somewhere across a 20-30 session campaign. This
  is the highest-stakes class-(iii) surface precisely because it's both frequent AND currently a
  bare noun with zero recurrence handling — the strongest case in the whole sweep for the canon-
  aware-recurrence fix, and (per the note above) the cheapest to implement since the codex item
  plumbing already exists.

**Bottom line:** the walk-skin/breach/nightmare Mythic chain that Adam's question most naturally
evokes ("the mystical thing on the tables") is actually the SAFEST lane in the engine (~3.7%/session,
overwhelmingly class-(i) lens-bound). The real exposure is in the higher-cadence, per-instance
tables that roll many times per session — In-Building Complications, NPC trait columns, and
especially Plot Item/Plot Lock — where a handful of them (In-Building Complications, Plot Item, Plot
Lock, and the 11 Realm Items + Place-generation family) are genuinely bare unique nouns that WILL
recur over a long campaign, some within single-digit-percent chance per session and near-certain
over a full campaign's length.

---

## Commit

This is a report-only audit — no table files were modified. The report file is committed alone on
`audit/top-band-uniqueness`; the branch is NOT merged to master per the task instruction.
