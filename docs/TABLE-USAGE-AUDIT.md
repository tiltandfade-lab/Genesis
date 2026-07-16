# Genesis — Table Usage Audit

*Generated snapshot — regenerate with `python3 build/gen-table-usage-audit.py` after wiring/table changes.*

**What this maps:** every compiled table (`tables.json`) → source file → what *triggers* it. The Oracle tab rolls **any** table manually, so "trigger" means an **automatic** call: a generator **procedure**, a **roll-chain**, or **wired code**. Tables with none are **Oracle-only** — authored but not in any flow (wire-up or retire candidates). *Caveat: two unwired tables that cross-link each other read as ⛓ chained.*

**Totals:** 386 tables / 306 files.  
By table — ▶ procedure: **0** · ⛓ chained: **1** · 🔗 wired: **355** · ⚠️ Oracle-only: **30**.  
⚠️ Oracle-only source files: **19** of 306.

---

## ⚠️ Unused tables (Oracle-only) — the shortlist

Authored content not reached by any procedure, chain, or code. Click through to judge keep-and-wire vs. retire.

### Session Mechanics
- [[Walk Nightmare - Dungeon]] — d20, 20 rows
- [[Walk Nightmare - Urban]] — d20, 20 rows
- [[Walk Nightmare - Wilderness]] — d20, 20 rows

### Session Mechanics / Dungeons
- [[Wilderness Dressing Mega Table]] — 12 sub-tables

### Session Mechanics / Realms
- [[Realm Items - Ash]] — d50, 50 rows
- [[Realm Items - Bright-Kingdom]] — d55, 55 rows
- [[Realm Items - Chrome]] — d50, 50 rows
- [[Realm Items - Cosmic]] — d50, 50 rows
- [[Realm Items - Frontier]] — d50, 50 rows
- [[Realm Items - Gloom]] — d50, 50 rows
- [[Realm Items - High-Seas]] — d50, 50 rows
- [[Realm Items - Lost-World]] — d54, 54 rows
- [[Realm Items - Noir]] — d50, 50 rows
- [[Realm Items - Suburb]] — d62, 62 rows
- [[Realm Items - Theater]] — d50, 50 rows

### Social / Factions
- [[Faction Outcome]] — d20, 20 rows

### Social / Sentient NPCs
- [[Animal Tell]] — d20, 20 rows
- [[Child Saw]] — d100, 100 rows
- [[Child Want]] — d20, 20 rows

---

## Full catalog — every table & its trigger

### Character Genesis
- [[Genesis Backgrounds]] — 🔗 **wired in code** — srd-creator.js, table-atlas.js  *(6 sub-tables)*
- [[Life & Origins]] — 🔗 **wired in code** — codex-roll.js, table-atlas.js  *(11 sub-tables)*

### Character Genesis / PC Traits
- [[PC Bond]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[PC Flaws]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*

### Realms / Place Generation
- [[Place Spine]] — 🔗 **wired in code** — place-skins.js, wiki.js  *(d24, 24 rows)*

### Session Mechanics
- [[Chase Complications]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Distant Word]] — 🔗 **wired in code** — codex-roll.js, companions.js, crowning-ritual.js, gap-wiring.js, region.js, reputation.js, table-atlas.js, tarot.js, urban.js  *(d100, 100 rows)*
- [[Downtime Ledger]] — 🔗 **wired in code** — gap-wiring.js, table-atlas.js  *(d100, 100 rows)*
- [[Festival and Holy Days]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Life Event]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Drift]] — 🔗 **wired in code** — dm.js, table-atlas.js  *(d100, 100 rows)*
- [[Shrine and Omen]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Walk Breach - Urban]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Walk Breach - Wilderness]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Walk Skin - Dungeon]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Walk Skin - Urban]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Walk Skin - Wilderness]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Walk Breach - Dungeon]] — ⛓ chained from Walk Breach - Urban.md, Walk Breach - Wilderness.md  *(d20, 20 rows)*
- [[Walk Nightmare - Dungeon]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Nightmare - Urban]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Walk Nightmare - Wilderness]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Session Mechanics / Consequences
- [[Mythic Failure Lenses]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Mythic Success Lenses]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Watcher Effect Pool]] — 🔗 **wired in code** — table-atlas.js  *(d8, 8 rows)*

### Session Mechanics / Dungeons
- [[Dungeon Area Type]] — 🔗 **wired in code** — dungeon-walk.js, place-spatialize.js, table-atlas.js  *(d200, 200 rows)*
- [[Dungeon Art Motif]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Art Motif Modifier]] — 🔗 **wired in code** — table-atlas.js  *(d6, 6 rows)*
- [[Dungeon Boss]] — 🔗 **wired in code** — combat.js, table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Contact]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Dungeon Discovery Content]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Dungeon Discovery Form]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Dungeon Distortion]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Door State]] — 🔗 **wired in code** — table-atlas.js, theater-boot.js, walk-interactables.js  *(d20, 20 rows)*
- [[Dungeon Door Type]] — 🔗 **wired in code** — table-atlas.js, theater-boot.js  *(d50, 50 rows)*
- [[Dungeon Dressing Mega Table]] — 🔗 **wired in code** — dungeon-walk.js, table-atlas.js  *(6 sub-tables)*
- [[Dungeon Empty Result]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Encounter Type]] — 🔗 **wired in code** — dungeon-walk.js, table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Enemy Category]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Dungeon Enemy Composition]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Environment Skin]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Exit Destination Type]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Exit State]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Feature]] — 🔗 **wired in code** — table-atlas.js, walk-interactables.js  *(d153, 153 rows)*
- [[Dungeon Finale Type]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Hazard]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Dungeon Interactable Object]] — 🔗 **wired in code** — table-atlas.js, walk-interactables.js  *(d100, 100 rows)*
- [[Dungeon Lighting]] — 🔗 **wired in code** — blockwright.js, render.js, table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Loot - Artifact]] — 🔗 **wired in code** — table-atlas.js  *(d1, 1 rows)*
- [[Dungeon Loot - Common]] — 🔗 **wired in code** — table-atlas.js  *(d31, 31 rows)*
- [[Dungeon Loot - Junk]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Dungeon Loot - Legendary]] — 🔗 **wired in code** — table-atlas.js  *(d32, 32 rows)*
- [[Dungeon Loot - Minor Resource]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Loot - Minor Wondrous]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Loot - Outlandish]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Dungeon Loot - Rare]] — 🔗 **wired in code** — table-atlas.js  *(d101, 101 rows)*
- [[Dungeon Loot - Uncommon]] — 🔗 **wired in code** — table-atlas.js  *(d87, 87 rows)*
- [[Dungeon Loot - Valuables]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Loot - Very Rare]] — 🔗 **wired in code** — table-atlas.js  *(d64, 64 rows)*
- [[Dungeon Loot Composition]] — 🔗 **wired in code** — table-atlas.js  *(d100, 7 rows)*
- [[Dungeon Loot Empty]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Lore Art]] — 🔗 **wired in code** — table-atlas.js  *(d30, 5 rows)*
- [[Dungeon Lore Content]] — 🔗 **wired in code** — table-atlas.js  *(d30, 5 rows)*
- [[Dungeon Narrative Device]] — 🔗 **wired in code** — table-atlas.js  *(d36, 36 rows)*
- [[Dungeon Origin]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Problem]] — 🔗 **wired in code** — table-atlas.js, wiring-b.js  *(d50, 50 rows)*
- [[Dungeon Reinforcements]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Dungeon Rest Complications]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Revelation]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Scene]] — 🔗 **wired in code** — table-atlas.js  *(d36, 36 rows)*
- [[Dungeon Secret Payoff Size]] — 🔗 **wired in code** — table-atlas.js  *(d6, 6 rows)*
- [[Dungeon Secret Reveal Type]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Secret Tier]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Secret Type]] — 🔗 **wired in code** — table-atlas.js  *(d8, 8 rows)*
- [[Dungeon Sensory]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Dungeon Set Dressing]] — 🔗 **wired in code** — dungeon-walk.js, table-atlas.js  *(d108, 108 rows)*
- [[Dungeon Set Dressing Condition]] — 🔗 **wired in code** — dungeon-walk.js, table-atlas.js  *(d20, 20 rows)*
- [[Dungeon Tactical Terrain]] — 🔗 **wired in code** — table-atlas.js  *(d10, 10 rows)*
- [[Dungeon Threat Identity T1]] — 🔗 **wired in code** — table-atlas.js  *(d30, 30 rows)*
- [[Dungeon Threat Identity T2]] — 🔗 **wired in code** — table-atlas.js  *(d45, 45 rows)*
- [[Dungeon Threat Profile]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Dungeon Topology]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Dungeon Type]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Puzzle Failsafe]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Puzzle Mechanism]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Puzzle Solution Path]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Puzzle Type]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Room Elevation Profile]] — 🔗 **wired in code** — dungeon-walk.js  *(d100, 7 rows)*
- [[Urban Area Type]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Urban Art]] — 🔗 **wired in code** — table-atlas.js  *(3 sub-tables)*
- [[Urban Art Motif]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Art Motif Modifier]] — 🔗 **wired in code** — table-atlas.js  *(d6, 6 rows)*
- [[Urban Boon]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Boss]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Catalyst]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Urban Commerce]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Contact]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Urban District Type]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Dressing Mega Table]] — 🔗 **wired in code** — table-atlas.js  *(12 sub-tables)*
- [[Urban Empty Result]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Urban Encounter Type]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Enemy Category]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Urban Enemy Composition]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Environment Skin]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Exit State]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Urban Feature]] — 🔗 **wired in code** — table-atlas.js  *(d103, 103 rows)*
- [[Urban Footing]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Foreground Event]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Urban Hazard]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Interactable Object]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Urban Lighting]] — 🔗 **wired in code** — table-atlas.js  *(d50, 9 rows)*
- [[Urban Magic Effect Lv 1-5]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Magic Effect Lv 6-10]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Narrative Device]] — 🔗 **wired in code** — table-atlas.js  *(d36, 36 rows)*
- [[Urban Origin]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Problem]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Urban Reinforcements]] — 🔗 **wired in code** — table-atlas.js  *(d6, 6 rows)*
- [[Urban Rest Complications]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Revelation]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Rumor Intel]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Scene Frame]] — 🔗 **wired in code** — table-atlas.js  *(d400, 400 rows)*
- [[Urban Scene Frame — Open]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Scene Frame — Street]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Scene Frame — Threshold]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Scene Frame — Vertical]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Secret Payoff Size]] — 🔗 **wired in code** — table-atlas.js  *(d6, 6 rows)*
- [[Urban Secret Reveal Type]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Secret Tier]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Secrets]] — 🔗 **wired in code** — table-atlas.js  *(d98, 50 rows)*
- [[Urban Segment Approach]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Cold Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Escalation]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Event Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Excursion]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Faction Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Fragment]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Hot Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Hub]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Inner]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Lead]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Opening]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Path]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Urban Segment Side Lead]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Surface]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Threshold]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Warm Scene]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Segment Waypoint]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Sensory]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Urban Set Dressing]] — 🔗 **wired in code** — table-atlas.js, walk.js  *(d105, 105 rows)*
- [[Urban Set Dressing Condition]] — 🔗 **wired in code** — table-atlas.js, walk.js  *(d20, 20 rows)*
- [[Urban Spectacle]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Street Distortion]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Urban Tactical Setup]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Urban Threat Identity T1]] — 🔗 **wired in code** — table-atlas.js  *(d30, 30 rows)*
- [[Urban Threat Identity T2]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Urban Threat Profile]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Urban Type]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Wilderness Area Type]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Wilderness Art]] — 🔗 **wired in code** — table-atlas.js, wiring-b.js  *(3 sub-tables)*
- [[Wilderness Background Event]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Wilderness Biome Type]] — 🔗 **wired in code** — table-atlas.js, theater-data.js  *(d10, 10 rows)*
- [[Wilderness Contact]] — 🔗 **wired in code** — table-atlas.js  *(d500, 500 rows)*
- [[Wilderness Empty Result]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Encounter Type]] — 🔗 **wired in code** — table-atlas.js, wild-walk.js  *(d20, 20 rows)*
- [[Wilderness Enemy Category]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Enemy Composition]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Feature]] — 🔗 **wired in code** — table-atlas.js  *(d303, 303 rows)*
- [[Wilderness Footing]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Wilderness Hazard]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Wilderness Interactable Object]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Wilderness Lighting and Weather]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Magic Effect Lv 1-5]] — 🔗 **wired in code** — table-atlas.js  *(d200, 200 rows)*
- [[Wilderness Problem]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Wilderness Sensory]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Wilderness Set Dressing]] — 🔗 **wired in code** — table-atlas.js, theater-data.js  *(d305, 305 rows)*
- [[Wilderness Set Dressing Condition]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Sign of Passage]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Wilderness Survival Constraint]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Wilderness Tactical Terrain]] — 🔗 **wired in code** — table-atlas.js  *(d50, 50 rows)*
- [[Wilderness Dressing Mega Table]] — ⚠️ **Oracle-only — no auto trigger**  *(12 sub-tables)*

### Session Mechanics / Items & Rewards
- [[Cuisine Effects]] — 🔗 **wired in code** — table-atlas.js  *(1d12, 12 rows)*
- [[Supernatural Blessings]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Supernatural Charms]] — 🔗 **wired in code** — social.js, table-atlas.js  *(d20, 20 rows)*
- [[Trinket Table]] — 🔗 **wired in code** — table-atlas.js  *(2d20, 39 rows)*

### Session Mechanics / Monsters
- [[Creature Parley - What It Wants]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Monster Behavior if Hunted]] — 🔗 **wired in code** — table-atlas.js  *(1d10, 10 rows)*
- [[Monster Meal Viability]] — 🔗 **wired in code** — table-atlas.js  *(1d20, 9 rows)*
- [[Monster Motivation]] — 🔗 **wired in code** — codex.js, table-atlas.js  *(1d20, 8 rows)*
- [[Morale Outcome]] — 🔗 **wired in code** — dm.js, social.js, table-atlas.js  *(d20, 20 rows)*

### Session Mechanics / Pressure
- [[In-Building Complications]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Starting State Pressure]] — 🔗 **wired in code** — table-atlas.js  *(d100, 24 rows)*
- [[Urban Pressure]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*

### Session Mechanics / Realms
- [[Realm Items - Ash]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Bright-Kingdom]] — ⚠️ **Oracle-only — no auto trigger**  *(d55, 55 rows)*
- [[Realm Items - Chrome]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Cosmic]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Frontier]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Gloom]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - High-Seas]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Lost-World]] — ⚠️ **Oracle-only — no auto trigger**  *(d54, 54 rows)*
- [[Realm Items - Noir]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*
- [[Realm Items - Suburb]] — ⚠️ **Oracle-only — no auto trigger**  *(d62, 62 rows)*
- [[Realm Items - Theater]] — ⚠️ **Oracle-only — no auto trigger**  *(d50, 50 rows)*

### Session Mechanics / Travel & Resting
- [[Camp Cooking Complications]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Biome]] — 🔗 **wired in code** — table-atlas.js  *(d100, 12 rows)*
- [[Travel Choice Prompt]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Travel Complication]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Travel Destination Arrival State]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Destination Type]] — 🔗 **wired in code** — table-atlas.js  *(d100, 10 rows)*
- [[Travel Event Type]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Landmark]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Travel Route Distortion]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Route Type]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Scene]] — 🔗 **wired in code** — table-atlas.js  *(d12, 12 rows)*
- [[Travel Threat]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*

### Session Mechanics / Urban Fabric
- [[Tavern - Barkeep Quirk]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Tavern - Foundation]] — 🔗 **wired in code** — table-atlas.js  *(4 sub-tables)*
- [[Tavern - In Media Res]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Tavern - Name]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Tavern - Sensory Atmosphere]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*

### Session Mechanics / encounters
- [[Region Encounter]] — 🔗 **wired in code** — table-atlas.js, wiring-a.js  *(d20, 20 rows)*
- [[Tavern Encounters]] — 🔗 **wired in code** — table-atlas.js  *(d12+d8, 19 rows)*

### Social
- [[Social-taboos]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*

### Social / Factions
- [[Patron Archetype]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Faction Outcome]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Social / Quests & Problems
- [[Plot Item]] — 🔗 **wired in code** — dm.js, table-atlas.js  *(d300, 300 rows)*
- [[Plot Lock]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Quest Complication]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Quest Destination]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Quest Macguffin]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Quest Questgiver Avoidance]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Quest Urgency]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*

### Social / Sentient NPCs
- [[Animal Kind]] — 🔗 **wired in code** — animal-knowledge-scope.js, animal-realm-skins.js  *(d12, 12 rows)*
- [[NPC Ability]] — 🔗 **wired in code** — table-atlas.js  *(d30, 30 rows)*
- [[NPC Appearance Detail]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Behavioral Detail]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Bonds]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[NPC Bonus Secret]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Common Races]] — 🔗 **wired in code** — table-atlas.js  *(d10, 10 rows)*
- [[NPC Demeanor]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Faction Ties]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Fear]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Flaws and Secrets]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[NPC Formative Grace]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Formative Trauma]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Honesty]] — 🔗 **wired in code** — table-atlas.js  *(2d10, 8 rows)*
- [[NPC Hook]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[NPC Hook Complication]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Ideal]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC If Cornered]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC If Ignored]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC If Ignored Regional Effects]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Immediate Mood]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Immediate Motivation]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[NPC Influence Weight]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Leverage]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Mannerisms]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Opening Attitude]] — 🔗 **wired in code** — codex.js, table-atlas.js  *(d20, 20 rows)*
- [[NPC Personality Trait]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Race Weighted]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Relationship to Town]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Resource Control]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Role]] — 🔗 **wired in code** — npc-role-skins.js, table-atlas.js, wiki.js  *(d100, 100 rows)*
- [[NPC Role Spine]] — 🔗 **wired in code** — npc-role-skins.js, wiki.js  *(d35, 35 rows)*
- [[NPC Side Quest - Job Board]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[NPC Talents]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Temperament]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Trust Lever]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Under Pressure]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[NPC Useful Knowledge]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Visual Quirk]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[NPC Want]] — 🔗 **wired in code** — social.js, table-atlas.js  *(2d50, 99 rows)*
- [[Wild Animal Kind]] — 🔗 **wired in code** — animal-knowledge-scope.js  *(d12, 12 rows)*
- [[Animal Tell]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*
- [[Child Saw]] — ⚠️ **Oracle-only — no auto trigger**  *(d100, 100 rows)*
- [[Child Want]] — ⚠️ **Oracle-only — no auto trigger**  *(d20, 20 rows)*

### Unsorted
- [[Misc Unsorted Tables]] — 🔗 **wired in code** — table-atlas.js  *(11 sub-tables)*

### World Building / Architectural Details
- [[Architecture Material]] — 🔗 **wired in code** — table-atlas.js  *(d20, 12 rows)*

### World Building / Atmospheric & Sensory
- [[Art Condition]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Art Depiction]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Art Medium]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Atmosphere Smells]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Atmosphere Sounds]] — 🔗 **wired in code** — table-atlas.js  *(d20, 12 rows)*
- [[Furniture & Clutter]] — 🔗 **wired in code** — table-atlas.js  *(2 sub-tables)*

### World Building / Mythic Events
- [[Myth Becomes Geography]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Myth Costs]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Myth Seeds]] — 🔗 **wired in code** — table-atlas.js  *(1d12, 12 rows)*
- [[Truth vs False]] — 🔗 **wired in code** — table-atlas.js  *(d20, 20 rows)*
- [[Witness Distortion Table]] — 🔗 **wired in code** — table-atlas.js  *(1d10, 10 rows)*

### World Building / Place Generation
- [[Building Interior]] — 🔗 **wired in code** — table-atlas.js  *(d300, 300 rows)*
- [[Master Setting]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place History]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Mythology]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Nearby]] — 🔗 **wired in code** — table-atlas.js, world-tables.js  *(d100, 100 rows)*
- [[Place Race Relations]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Relevancy]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Ruler Status]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place Traits]] — 🔗 **wired in code** — table-atlas.js  *(d100, 100 rows)*
- [[Place-Secret]] — 🔗 **wired in code** — codex-roll.js, table-atlas.js  *(d200, 200 rows)*
- [[Region Identity]] — 🔗 **wired in code** — blockwright.js, region.js, state.js, table-atlas.js, wiring-b.js  *(d100, 100 rows)*
- [[World Name Patterns]] — 🔗 **wired in code** — table-atlas.js, world-name.js  *(d20, 20 rows)*

### World Building / Starting State
- [[Starting State - Entry]] — 🔗 **wired in code** — table-atlas.js  *(3 sub-tables)*
- [[Starting State - Factions]] — 🔗 **wired in code** — table-atlas.js  *(5 sub-tables)*
- [[Starting State - Opening Bundle]] — 🔗 **wired in code** — starting-state.js, table-atlas.js  *(5 sub-tables)*
- [[Starting State - Pressures]] — 🔗 **wired in code** — table-atlas.js  *(10 sub-tables)*
- [[Starting State - World Depth]] — 🔗 **wired in code** — table-atlas.js  *(2 sub-tables)*
