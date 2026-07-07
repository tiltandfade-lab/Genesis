# Genesis — Table Usage Audit

*Generated snapshot — regenerate with `python3 build/gen-table-usage-audit.py` after wiring/table changes.*

**What this maps:** every compiled table (`tables.json`) → source file → what *triggers* it. The Oracle tab rolls **any** table manually, so "trigger" means an **automatic** call: a generator **procedure**, a **roll-chain**, or **wired code**. Tables with none are **Oracle-only** — authored but not in any flow (wire-up or retire candidates). *Caveat: two unwired tables that cross-link each other read as ⛓ chained.*

**Totals:** 378 tables / 298 files.  
By table — ▶ procedure: **163** · ⛓ chained: **25** · 🔗 wired: **54** · ⚠️ Oracle-only: **136**.  
⚠️ Oracle-only source files: **114** of 298.

---

## ⚠️ Unused tables (Oracle-only) — the shortlist

Authored content not reached by any procedure, chain, or code. Click through to judge keep-and-wire vs. retire.

### Session Mechanics
- [[Chase Complications]] — d100, 100 rows
- [[Festival and Holy Days]] — d100, 100 rows
- [[NPC Life Event]] — d100, 100 rows
- [[Shrine and Omen]] — d100, 100 rows
- [[Walk Breach - Urban]] — d20, 20 rows
- [[Walk Breach - Wilderness]] — d20, 20 rows
- [[Walk Nightmare - Dungeon]] — d20, 20 rows
- [[Walk Nightmare - Urban]] — d20, 20 rows
- [[Walk Nightmare - Wilderness]] — d20, 20 rows
- [[Walk Skin - Dungeon]] — d100, 100 rows
- [[Walk Skin - Urban]] — d100, 100 rows
- [[Walk Skin - Wilderness]] — d100, 100 rows

### Session Mechanics / Consequences
- [[Watcher Effect Pool]] — d8, 8 rows

### Session Mechanics / Dungeons
- [[Dungeon Discovery Content]] — d50, 50 rows
- [[Dungeon Discovery Form]] — d50, 50 rows
- [[Dungeon Distortion]] — d20, 20 rows
- [[Dungeon Loot - Valuables]] — d100, 100 rows
- [[Dungeon Loot Empty]] — d100, 100 rows
- [[Dungeon Lore Art]] — d30, 5 rows
- [[Dungeon Lore Content]] — d30, 5 rows
- [[Dungeon Narrative Device]] — d36, 36 rows
- [[Dungeon Threat Identity T1]] — d30, 30 rows
- [[Dungeon Threat Identity T2]] — d45, 45 rows
- [[Urban Boon]] — d20, 20 rows
- [[Urban Catalyst]] — d200, 200 rows
- [[Urban Commerce]] — d100, 100 rows
- [[Urban Magic Effect Lv 6-10]] — d100, 100 rows
- [[Urban Narrative Device]] — d36, 36 rows
- [[Urban Rumor Intel]] — d100, 100 rows
- [[Urban Scene]] — d20, 20 rows
- [[Urban Scene Frame]] — d400, 400 rows
- [[Urban Scene Frame — Open]] — d100, 100 rows
- [[Urban Scene Frame — Street]] — d100, 100 rows
- [[Urban Scene Frame — Threshold]] — d100, 100 rows
- [[Urban Scene Frame — Vertical]] — d100, 100 rows
- [[Urban Secret Payoff Size]] — d6, 6 rows
- [[Urban Secret Reveal Type]] — d20, 20 rows
- [[Urban Secret Tier]] — d20, 20 rows
- [[Urban Segment Approach]] — d20, 20 rows
- [[Urban Segment Cold Scene]] — d20, 20 rows
- [[Urban Segment Escalation]] — d20, 20 rows
- [[Urban Segment Event Scene]] — d20, 20 rows
- [[Urban Segment Excursion]] — d20, 20 rows
- [[Urban Segment Faction Scene]] — d20, 20 rows
- [[Urban Segment Fragment]] — d20, 20 rows
- [[Urban Segment Hot Scene]] — d20, 20 rows
- [[Urban Segment Hub]] — d20, 20 rows
- [[Urban Segment Inner]] — d20, 20 rows
- [[Urban Segment Lead]] — d20, 20 rows
- [[Urban Segment Opening]] — d20, 20 rows
- [[Urban Segment Path]] — d300, 300 rows
- [[Urban Segment Side Lead]] — d20, 20 rows
- [[Urban Segment Surface]] — d20, 20 rows
- [[Urban Segment Threshold]] — d20, 20 rows
- [[Urban Segment Warm Scene]] — d20, 20 rows
- [[Urban Segment Waypoint]] — d20, 20 rows
- [[Urban Spectacle]] — d100, 100 rows
- [[Urban Street Distortion]] — d12, 12 rows
- [[Urban Tactical Setup]] — d20, 20 rows
- [[Urban Threat Identity T1]] — d30, 30 rows
- [[Urban Threat Identity T2]] — d50, 50 rows
- [[Wilderness Dressing Mega Table]] — 12 sub-tables

### Session Mechanics / Items & Rewards
- [[Cuisine Effects]] — 1d12, 12 rows
- [[Supernatural Blessings]] — d20, 20 rows
- [[Trinket Table]] — 2d20, 39 rows

### Session Mechanics / Monsters
- [[Monster Meal Viability]] — 1d20, 9 rows

### Session Mechanics / Pressure
- [[In-Building Complications]] — d100, 100 rows

### Session Mechanics / Realms
- [[Realm Items - Ash]] — d50, 50 rows
- [[Realm Items - Bright-Kingdom]] — d50, 50 rows
- [[Realm Items - Chrome]] — d50, 50 rows
- [[Realm Items - Cosmic]] — d50, 50 rows
- [[Realm Items - Frontier]] — d50, 50 rows
- [[Realm Items - Gloom]] — d50, 50 rows
- [[Realm Items - High-Seas]] — d50, 50 rows
- [[Realm Items - Lost-World]] — d50, 50 rows
- [[Realm Items - Noir]] — d50, 50 rows
- [[Realm Items - Suburb]] — d50, 50 rows
- [[Realm Items - Theater]] — d50, 50 rows

### Session Mechanics / Travel & Resting
- [[Camp Cooking Complications]] — d12, 12 rows

### Social / Factions
- [[Faction Outcome]] — d20, 20 rows
- [[Patron Archetype]] — d20, 20 rows

### Social / Quests & Problems
- [[Plot Item]] — d300, 300 rows
- [[Plot Lock]] — d300, 300 rows
- [[Quest Complication]] — d20, 20 rows
- [[Quest Destination]] — d20, 20 rows
- [[Quest Macguffin]] — d20, 20 rows
- [[Quest Questgiver Avoidance]] — d20, 20 rows
- [[Quest Urgency]] — d20, 20 rows

### Social / Sentient NPCs
- [[NPC Appearance Detail]] — d20, 20 rows
- [[NPC Behavioral Detail]] — d20, 20 rows
- [[NPC Common Races]] — d10, 10 rows
- [[NPC Faction Ties]] — d100, 100 rows
- [[NPC Formative Grace]] — d100, 100 rows
- [[NPC Formative Trauma]] — d100, 100 rows
- [[NPC Ideal]] — d100, 100 rows
- [[NPC If Ignored]] — d100, 100 rows
- [[NPC If Ignored Regional Effects]] — d100, 100 rows
- [[NPC Immediate Motivation]] — d300, 300 rows
- [[NPC Influence Weight]] — d20, 20 rows
- [[NPC Personality Trait]] — d100, 100 rows
- [[NPC Relationship to Town]] — d20, 20 rows
- [[NPC Resource Control]] — d100, 100 rows
- [[NPC Side Quest - Job Board]] — d300, 300 rows
- [[NPC Temperament]] — d20, 20 rows
- [[NPC Under Pressure]] — d20, 20 rows

### Unsorted
- [[Misc Unsorted Tables]] — 11 sub-tables

### World Building / Mythic Events
- [[Witness Distortion Table]] — 1d10, 10 rows

### World Building / Place Generation
- [[Building Interior]] — d300, 300 rows
- [[Place History]] — d100, 100 rows
- [[Place Race Relations]] — d100, 100 rows
- [[Place Relevancy]] — d100, 100 rows
- [[Place Ruler Status]] — d100, 100 rows
- [[Place Traits]] — d100, 100 rows

### World Building / Starting State
- [[Starting State - World Depth]] — 2 sub-tables

---

## Full catalog — every table & its trigger

### Character Genesis
- [[Genesis Backgrounds]] — 🔗 **wired in code** — srd-creator.js  *(6 sub-tables)*
- [[Life & Origins]] — 🔗 **wired in code** — codex-roll.js  *(11 sub-tables)*

### Character Genesis / PC Traits
- [[PC Bond]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[PC Flaws]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*

### Session Mechanics
- [[Distant Word]] — 🔗 **wired in code** — codex-roll.js, companions.js, gap-wiring.js, region.js, reputation.js, tarot.js, urban.js  *(d100, 100 rows)*
- [[Downtime Ledger]] — 🔗 **wired in code** — gap-wiring.js  *(d100, 100 rows)*
- [[Place Drift]] — 🔗 **wired in code** — dm.js  *(d100, 100 rows)*
- [[Walk Breach - Dungeon]] — ⛓ chained from Walk Breach - Urban.md, Walk Breach - Wilderness.md  *(d20, 20 rows)*
- [[Chase Complications]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Festival and Holy Days]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Life Event]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Shrine and Omen]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Walk Breach - Urban]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Breach - Wilderness]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Nightmare - Dungeon]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Nightmare - Urban]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Nightmare - Wilderness]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Skin - Dungeon]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Walk Skin - Urban]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Walk Skin - Wilderness]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*

### Session Mechanics / Consequences
- [[Mythic Failure Lenses]] — ⛓ chained from Mythic Success Lenses.md  *(d12, 12 rows)*
- [[Mythic Success Lenses]] — ⛓ chained from Mythic Failure Lenses.md  *(d12, 12 rows)*
- [[Watcher Effect Pool]] — ⚠️ **Oracle-only — no auto trigger**  *(d8, 8 rows)*

### Session Mechanics / Dungeons
- [[Dungeon Boss]] — 🔗 **wired in code** — combat.js  *(d100, 100 rows)*
- [[Dungeon Dressing Mega Table]] — 🔗 **wired in code** — dungeon-walk.js  *(6 sub-tables)*
- [[Dungeon Encounter Type]] — 🔗 **wired in code** — dungeon-walk.js  *(d20, 20 rows)*
- [[Dungeon Lighting]] — 🔗 **wired in code** — blockwright.js, render.js  *(d100, 100 rows)*
- [[Dungeon Problem]] — 🔗 **wired in code** — wiring-b.js  *(d50, 50 rows)*
- [[Dungeon Set Dressing]] — 🔗 **wired in code** — dungeon-walk.js  *(d100, 100 rows)*
- [[Dungeon Set Dressing Condition]] — 🔗 **wired in code** — dungeon-walk.js  *(d20, 20 rows)*
- [[Urban Set Dressing]] — 🔗 **wired in code** — walk.js  *(d100, 100 rows)*
- [[Urban Set Dressing Condition]] — 🔗 **wired in code** — walk.js  *(d20, 20 rows)*
- [[Wilderness Art]] — 🔗 **wired in code** — wiring-b.js  *(3 sub-tables)*
- [[Wilderness Encounter Type]] — 🔗 **wired in code** — wild-walk.js  *(d20, 20 rows)*
- [[Wilderness Set Dressing]] — 🔗 **wired in code** — theater-data.js  *(d300, 300 rows)*
- [[Dungeon Area Type]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d200, 200 rows)*
- [[Dungeon Art Motif]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Art Motif Modifier]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d6, 6 rows)*
- [[Dungeon Contact]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d300, 300 rows)*
- [[Dungeon Door State]] — ▶ via Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Door Type]] — ▶ via Dungeon Encounter  *(d50, 50 rows)*
- [[Dungeon Empty Result]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Enemy Category]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d200, 200 rows)*
- [[Dungeon Enemy Composition]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Environment Skin]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Exit Destination Type]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Exit State]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Feature]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d150, 150 rows)*
- [[Dungeon Finale Type]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Hazard]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d50, 50 rows)*
- [[Dungeon Interactable Object]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Loot - Artifact]] — ▶ via Treasure Generator V  *(d1, 1 rows)*
- [[Dungeon Loot - Common]] — ▶ via Treasure Generator V  *(d31, 31 rows)*
- [[Dungeon Loot - Junk]] — ▶ via Treasure Generator V  *(d300, 300 rows)*
- [[Dungeon Loot - Legendary]] — ▶ via Treasure Generator V  *(d32, 32 rows)*
- [[Dungeon Loot - Minor Wondrous]] — ▶ via Treasure Generator V  *(d100, 100 rows)*
- [[Dungeon Loot - Outlandish]] — ▶ via Treasure Generator V  *(d300, 300 rows)*
- [[Dungeon Loot - Rare]] — ▶ via Treasure Generator V  *(d101, 101 rows)*
- [[Dungeon Loot - Uncommon]] — ▶ via Treasure Generator V  *(d87, 87 rows)*
- [[Dungeon Loot - Very Rare]] — ▶ via Treasure Generator V  *(d64, 64 rows)*
- [[Dungeon Loot Composition]] — ▶ via Treasure Generator V  *(d100, 7 rows)*
- [[Dungeon Origin]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter, Pen & Paper Dungeon  *(d100, 100 rows)*
- [[Dungeon Reinforcements]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d12, 12 rows)*
- [[Dungeon Rest Complications]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Revelation]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Scene]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d36, 36 rows)*
- [[Dungeon Secret Payoff Size]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d6, 6 rows)*
- [[Dungeon Secret Reveal Type]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Secret Tier]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d20, 20 rows)*
- [[Dungeon Sensory]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d50, 50 rows)*
- [[Dungeon Tactical Terrain]] — ▶ via Dungeon Encounter  *(d10, 10 rows)*
- [[Dungeon Threat Profile]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter  *(d100, 100 rows)*
- [[Dungeon Topology]] — ▶ via Dungeon Encounter  *(d12, 12 rows)*
- [[Dungeon Type]] — ▶ via 5-Room Dungeon Generator, Dungeon Encounter, Pen & Paper Dungeon  *(d100, 100 rows)*
- [[Urban Area Type]] — ▶ via Urban Encounter  *(d200, 200 rows)*
- [[Urban Art]] — ▶ via Urban Encounter, Urban Set Up  *(3 sub-tables)*
- [[Urban Art Motif]] — ▶ via Urban Set Up  *(d20, 20 rows)*
- [[Urban Art Motif Modifier]] — ▶ via Urban Set Up  *(d6, 6 rows)*
- [[Urban Boss]] — ▶ via Urban Boss  *(d100, 100 rows)*
- [[Urban Contact]] — ▶ via Urban Encounter  *(d200, 200 rows)*
- [[Urban District Type]] — ▶ via Positive Urban Encounter, Urban Encounter  *(d20, 20 rows)*
- [[Urban Dressing Mega Table]] — ▶ via Urban Set Up  *(12 sub-tables)*
- [[Urban Empty Result]] — ▶ via Urban Encounter  *(d50, 50 rows)*
- [[Urban Encounter Type]] — ▶ via Urban Encounter  *(d20, 20 rows)*
- [[Urban Enemy Category]] — ▶ via Urban Encounter  *(d200, 200 rows)*
- [[Urban Enemy Composition]] — ▶ via Urban Encounter  *(d20, 20 rows)*
- [[Urban Environment Skin]] — ▶ via Urban Set Up  *(d100, 100 rows)*
- [[Urban Exit State]] — ▶ via Urban Boss  *(d12, 12 rows)*
- [[Urban Feature]] — ▶ via Urban Encounter  *(d100, 100 rows)*
- [[Urban Footing]] — ▶ via Urban Encounter  *(d100, 100 rows)*
- [[Urban Foreground Event]] — ▶ via Positive Urban Encounter, Urban Encounter  *(d300, 300 rows)*
- [[Urban Hazard]] — ▶ via Urban Encounter  *(d100, 100 rows)*
- [[Urban Interactable Object]] — ▶ via Urban Encounter  *(d300, 300 rows)*
- [[Urban Lighting]] — ▶ via Positive Urban Encounter, Urban Encounter  *(d50, 9 rows)*
- [[Urban Magic Effect Lv 1-5]] — ▶ via Urban Encounter  *(d100, 100 rows)*
- [[Urban Origin]] — ▶ via Urban Set Up  *(d100, 100 rows)*
- [[Urban Problem]] — ▶ via Urban Encounter  *(d200, 200 rows)*
- [[Urban Reinforcements]] — ▶ via Urban Set Up  *(d6, 6 rows)*
- [[Urban Rest Complications]] — ▶ via Urban Set Up  *(d20, 20 rows)*
- [[Urban Revelation]] — ▶ via Urban Boss  *(d20, 20 rows)*
- [[Urban Secrets]] — ▶ via Urban Encounter  *(d98, 50 rows)*
- [[Urban Sensory]] — ▶ via Positive Urban Encounter, Urban Encounter  *(d50, 50 rows)*
- [[Urban Threat Profile]] — ▶ via Urban Set Up  *(d100, 100 rows)*
- [[Urban Type]] — ▶ via Urban Set Up  *(d100, 100 rows)*
- [[Wilderness Area Type]] — ▶ via Wilderness Encounter  *(d300, 300 rows)*
- [[Wilderness Background Event]] — ▶ via Wilderness Encounter  *(d100, 100 rows)*
- [[Wilderness Biome Type]] — ▶ via Wilderness Encounter  *(d10, 10 rows)*
- [[Wilderness Contact]] — ▶ via Wilderness Encounter  *(d500, 500 rows)*
- [[Wilderness Empty Result]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Enemy Category]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Enemy Composition]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Feature]] — ▶ via Wilderness Encounter  *(d300, 300 rows)*
- [[Wilderness Footing]] — ▶ via Wilderness Encounter  *(d200, 200 rows)*
- [[Wilderness Hazard]] — ▶ via Wilderness Encounter  *(d50, 50 rows)*
- [[Wilderness Interactable Object]] — ▶ via Wilderness Encounter  *(d300, 300 rows)*
- [[Wilderness Lighting and Weather]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Magic Effect Lv 1-5]] — ▶ via Wilderness Encounter  *(d200, 200 rows)*
- [[Wilderness Problem]] — ▶ via Wilderness Encounter  *(d50, 50 rows)*
- [[Wilderness Sensory]] — ▶ via Wilderness Encounter  *(d100, 100 rows)*
- [[Wilderness Set Dressing Condition]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Sign of Passage]] — ▶ via Wilderness Encounter  *(d100, 100 rows)*
- [[Wilderness Survival Constraint]] — ▶ via Wilderness Encounter  *(d20, 20 rows)*
- [[Wilderness Tactical Terrain]] — ▶ via Wilderness Encounter  *(d50, 50 rows)*
- [[Dungeon Loot - Minor Resource]] — ⛓ chained from Dungeon Loot Composition.md  *(d100, 100 rows)*
- [[Dungeon Secret Type]] — ⛓ chained from Puzzle Type.md  *(d8, 8 rows)*
- [[Puzzle Failsafe]] — ⛓ chained from Puzzle Mechanism.md, Puzzle Solution Path.md, Puzzle Type.md  *(d20, 20 rows)*
- [[Puzzle Mechanism]] — ⛓ chained from Puzzle Failsafe.md, Puzzle Type.md  *(d20, 20 rows)*
- [[Puzzle Solution Path]] — ⛓ chained from Puzzle Failsafe.md, Puzzle Mechanism.md, Puzzle Type.md  *(d20, 20 rows)*
- [[Puzzle Type]] — ⛓ chained from Puzzle Mechanism.md  *(d20, 20 rows)*
- [[Dungeon Discovery Content]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Dungeon Discovery Form]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Dungeon Distortion]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Dungeon Loot - Valuables]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Dungeon Loot Empty]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Dungeon Lore Art]] — ⚠️ **Oracle-only — no auto trigger**  *(d30, 5 rows)*
- [[Dungeon Lore Content]] — ⚠️ **Oracle-only — no auto trigger**  *(d30, 5 rows)*
- [[Dungeon Narrative Device]] — ⚠️ **Oracle-only — no auto trigger**  *(d36, 36 rows)*
- [[Dungeon Threat Identity T1]] — ⚠️ **Oracle-only — no auto trigger**  *(d30, 30 rows)*
- [[Dungeon Threat Identity T2]] — ⚠️ **Oracle-only — no auto trigger**  *(d45, 45 rows)*
- [[Urban Boon]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Catalyst]] — ⚠️ **Oracle-only — no auto trigger**  *(d200, 200 rows)*
- [[Urban Commerce]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Magic Effect Lv 6-10]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Narrative Device]] — ⚠️ **Oracle-only — no auto trigger**  *(d36, 36 rows)*
- [[Urban Rumor Intel]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Scene Frame]] — ⚠️ **Oracle-only — no auto trigger**  *(d400, 400 rows)*
- [[Urban Scene Frame — Open]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Scene Frame — Street]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Scene Frame — Threshold]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Scene Frame — Vertical]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Secret Payoff Size]] — ⚠️ **Oracle-only — no auto trigger**  *(d6, 6 rows)*
- [[Urban Secret Reveal Type]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Secret Tier]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Approach]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Cold Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Escalation]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Event Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Excursion]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Faction Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Fragment]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Hot Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Hub]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Inner]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Lead]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Opening]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Path]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[Urban Segment Side Lead]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Surface]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Threshold]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Warm Scene]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Segment Waypoint]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Spectacle]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Urban Street Distortion]] — ⚠️ **Oracle-only — no auto trigger**  *(d12, 12 rows)*
- [[Urban Tactical Setup]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Urban Threat Identity T1]] — ⚠️ **Oracle-only — no auto trigger**  *(d30, 30 rows)*
- [[Urban Threat Identity T2]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Wilderness Dressing Mega Table]] — ⚠️ **Oracle-only — no auto trigger**  *(12 sub-tables)*

### Session Mechanics / Items & Rewards
- [[Supernatural Charms]] — 🔗 **wired in code** — social.js  *(d20, 20 rows)*
- [[Cuisine Effects]] — ⚠️ **Oracle-only — no auto trigger**  *(1d12, 12 rows)*
- [[Supernatural Blessings]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Trinket Table]] — ⚠️ **Oracle-only — no auto trigger**  *(2d20, 39 rows)*

### Session Mechanics / Monsters
- [[Monster Motivation]] — 🔗 **wired in code** — codex.js  *(1d20, 8 rows)*
- [[Morale Outcome]] — 🔗 **wired in code** — dm.js, social.js  *(d20, 20 rows)*
- [[Creature Parley - What It Wants]] — ⛓ chained from Morale Outcome.md  *(d20, 20 rows)*
- [[Monster Behavior if Hunted]] — ⛓ chained from Creature Parley - What It Wants.md, Morale Outcome.md  *(1d10, 10 rows)*
- [[Monster Meal Viability]] — ⚠️ **Oracle-only — no auto trigger**  *(1d20, 9 rows)*

### Session Mechanics / Pressure
- [[Starting State Pressure]] — ▶ via _START_New World Procedure  *(d100, 24 rows)*
- [[Urban Pressure]] — ▶ via Urban Set Up  *(d100, 100 rows)*
- [[In-Building Complications]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*

### Session Mechanics / Realms
- [[Realm Items - Ash]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Bright-Kingdom]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Chrome]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Cosmic]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Frontier]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Gloom]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - High-Seas]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Lost-World]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Noir]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Suburb]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Theater]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*

### Session Mechanics / Travel & Resting
- [[Travel Biome]] — ▶ via Travel Procedure  *(d100, 12 rows)*
- [[Travel Choice Prompt]] — ▶ via Travel Procedure  *(d20, 20 rows)*
- [[Travel Complication]] — ▶ via Travel Procedure  *(d20, 20 rows)*
- [[Travel Destination Arrival State]] — ▶ via Travel Procedure  *(d12, 12 rows)*
- [[Travel Destination Type]] — ▶ via Travel Procedure  *(d100, 10 rows)*
- [[Travel Event Type]] — ▶ via Travel Procedure  *(d12, 12 rows)*
- [[Travel Landmark]] — ▶ via Travel Procedure  *(d20, 20 rows)*
- [[Travel Route Distortion]] — ▶ via Travel Procedure  *(d12, 12 rows)*
- [[Travel Route Type]] — ▶ via Travel Procedure  *(d12, 12 rows)*
- [[Travel Scene]] — ▶ via Travel Procedure  *(d12, 12 rows)*
- [[Travel Threat]] — ▶ via Travel Procedure  *(d20, 20 rows)*
- [[Camp Cooking Complications]] — ⚠️ **Oracle-only — no auto trigger**  *(d12, 12 rows)*

### Session Mechanics / Urban Fabric
- [[Tavern - Barkeep Quirk]] — ▶ via Tavern Generator  *(d20, 20 rows)*
- [[Tavern - Foundation]] — ▶ via Tavern Generator  *(4 sub-tables)*
- [[Tavern - In Media Res]] — ▶ via Tavern Generator  *(d20, 20 rows)*
- [[Tavern - Name]] — ▶ via Tavern Generator  *(d20, 20 rows)*
- [[Tavern - Sensory Atmosphere]] — ▶ via Tavern Generator  *(d20, 20 rows)*

### Session Mechanics / encounters
- [[Region Encounter]] — 🔗 **wired in code** — wiring-a.js  *(d20, 20 rows)*
- [[Tavern Encounters]] — ⛓ chained from Urban Pressure.md  *(d12+d8, 19 rows)*

### Social
- [[Social-taboos]] — ▶ via _START_New World Procedure  *(d20, 20 rows)*

### Social / Factions
- [[Faction Outcome]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Patron Archetype]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Social / Quests & Problems
- [[Plot Item]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[Plot Lock]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[Quest Complication]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Quest Destination]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Quest Macguffin]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Quest Questgiver Avoidance]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Quest Urgency]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Social / Sentient NPCs
- [[NPC Opening Attitude]] — 🔗 **wired in code** — codex.js  *(d20, 20 rows)*
- [[NPC Want]] — 🔗 **wired in code** — social.js  *(d20, 20 rows)*
- [[NPC Ability]] — ▶ via Quick NPC Generator  *(d30, 30 rows)*
- [[NPC Bonds]] — ▶ via Quick NPC Generator  *(d300, 300 rows)*
- [[NPC Bonus Secret]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Flaws and Secrets]] — ▶ via Quick NPC Generator  *(d300, 300 rows)*
- [[NPC Hook]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Hook Complication]] — ▶ via Quick NPC Generator  *(d20, 20 rows)*
- [[NPC Mannerisms]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Race Weighted]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Role]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Talents]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Useful Knowledge]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Visual Quirk]] — ▶ via Quick NPC Generator  *(d100, 100 rows)*
- [[NPC Demeanor]] — ⛓ chained from NPC Opening Attitude.md, NPC Trust Lever.md  *(d100, 100 rows)*
- [[NPC Fear]] — ⛓ chained from NPC Honesty.md, NPC Opening Attitude.md, NPC Trust Lever.md  *(d20, 20 rows)*
- [[NPC Honesty]] — ⛓ chained from NPC Opening Attitude.md, NPC Trust Lever.md  *(2d10, 8 rows)*
- [[NPC If Cornered]] — ⛓ chained from Morale Outcome.md  *(d100, 100 rows)*
- [[NPC Immediate Mood]] — ⛓ chained from NPC Opening Attitude.md  *(d20, 20 rows)*
- [[NPC Leverage]] — ⛓ chained from Creature Parley - What It Wants.md, NPC Honesty.md, NPC Opening Attitude.md  *(d100, 100 rows)*
- [[NPC Trust Lever]] — ⛓ chained from NPC Honesty.md, NPC Opening Attitude.md  *(d20, 20 rows)*
- [[NPC Appearance Detail]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[NPC Behavioral Detail]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[NPC Common Races]] — ⚠️ **Oracle-only — no auto trigger**  *(d10, 10 rows)*
- [[NPC Faction Ties]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Formative Grace]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Formative Trauma]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Ideal]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC If Ignored]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC If Ignored Regional Effects]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Immediate Motivation]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[NPC Influence Weight]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[NPC Personality Trait]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Relationship to Town]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[NPC Resource Control]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[NPC Side Quest - Job Board]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[NPC Temperament]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[NPC Under Pressure]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Unsorted
- [[Misc Unsorted Tables]] — ⚠️ **Oracle-only — no auto trigger**  *(11 sub-tables)*

### World Building / Architectural Details
- [[Architecture Material]] — ▶ via _START_New World Procedure  *(d20, 12 rows)*

### World Building / Atmospheric & Sensory
- [[Art Condition]] — ▶ via 5-Room Dungeon Generator, Wilderness Encounter  *(d100, 100 rows)*
- [[Art Depiction]] — ▶ via 5-Room Dungeon Generator  *(d100, 100 rows)*
- [[Art Medium]] — ▶ via 5-Room Dungeon Generator  *(d100, 100 rows)*
- [[Atmosphere Smells]] — ▶ via _START_New World Procedure  *(d20, 20 rows)*
- [[Atmosphere Sounds]] — ▶ via _START_New World Procedure  *(d20, 12 rows)*
- [[Furniture & Clutter]] — ⛓ chained from Blank Tavern AI draft.md  *(2 sub-tables)*

### World Building / Mythic Events
- [[Myth Becomes Geography]] — ⛓ chained from Myth Costs.md, Mythic Failure Lenses.md, Mythic Success Lenses.md  *(d100, 100 rows)*
- [[Myth Costs]] — ⛓ chained from Myth Becomes Geography.md, Mythic Success Lenses.md  *(d100, 100 rows)*
- [[Myth Seeds]] — ⛓ chained from Myth Becomes Geography.md, Myth Costs.md, Mythic Success Lenses.md  *(1d12, 12 rows)*
- [[Truth vs False]] — ⛓ chained from Place Mythology.md  *(d20, 20 rows)*
- [[Witness Distortion Table]] — ⚠️ **Oracle-only — no auto trigger**  *(1d10, 10 rows)*

### World Building / Place Generation
- [[Place Nearby]] — 🔗 **wired in code** — world-tables.js  *(d100, 100 rows)*
- [[Place-Secret]] — 🔗 **wired in code** — codex-roll.js  *(d200, 200 rows)*
- [[Region Identity]] — 🔗 **wired in code** — blockwright.js, region.js, state.js, wiring-b.js  *(d100, 100 rows)*
- [[World Name Patterns]] — 🔗 **wired in code** — world-name.js  *(d20, 20 rows)*
- [[Master Setting]] — ▶ via _START_New World Procedure  *(d100, 100 rows)*
- [[Place Mythology]] — ▶ via _START_New World Procedure  *(d100, 100 rows)*
- [[Building Interior]] — ⚠️ **Oracle-only — no auto trigger**  *(d300, 300 rows)*
- [[Place History]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Place Race Relations]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Place Relevancy]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Place Ruler Status]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Place Traits]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*

### World Building / Starting State
- [[Starting State - Opening Bundle]] — 🔗 **wired in code** — starting-state.js  *(5 sub-tables)*
- [[Starting State - Entry]] — ▶ via Starting State Procedure  *(3 sub-tables)*
- [[Starting State - Factions]] — ▶ via Starting State Procedure  *(5 sub-tables)*
- [[Starting State - Pressures]] — ▶ via Starting State Procedure  *(10 sub-tables)*
- [[Starting State - World Depth]] — ⚠️ **Oracle-only — no auto trigger**  *(2 sub-tables)*
