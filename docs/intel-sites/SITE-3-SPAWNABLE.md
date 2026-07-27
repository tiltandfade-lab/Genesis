STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: spawn-audit
site: 3 — dormant / abandoned (a cross-host transform, not a host program)
created: 2026-07-27
source: docs/SITE-3-DORMANT-CONCEPT.md (working spec, 2026-07-27) ·
  Reference/Dormant-Abandoned-Study-0727/ (this pass's evidence) ·
  docs/intel/walk-census.md (demand)
authority: this document is an inventory, not a ruling. It classifies what the working spec
  implies can spawn against the CURRENT roller/table state, read from Engine markdown source
  (never from generated tables.js/json). Status values follow
  GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md's vocabulary: LIVE, LIVE-COMPOSED,
  AUTHORED-UNWIRED, ORACLE-MANUAL, INTERPRETIVE, TARGET-ADAPTER, or NO-TABLE-YET.
---

# SITE 3 SPAWNABLE-CONTENT INVENTORY

Every concrete thing the Site 3 working spec implies can spawn in play, mapped to the Engine
table/roller that would produce it, or marked `NO-TABLE-YET`. This feeds the spawn-audit lane;
it does not itself authorize wiring anything.

**Method.** Table ids were extracted literally from `src/engine/dungeon-walk.js`,
`src/engine/walk.js` and `src/engine/wild-walk.js`; rows were read from Engine markdown source
(never generated `tables.js`/`tables.json`, per repo-wide token discipline and the
settings-denied read list). Row numbers cited are from the current markdown source and may
drift if a table is re-authored; treat them as pointers, not stable ids. Where a table id
appears only in generated indexes (`data/table-usage.js`, `data/table-atlas.js`), it is
recorded as `AUTHORED-UNWIRED`, because presence in a generated index is not a caller.

**The headline for the spawn-audit lane.** Site 3 is the least under-supplied site in the
portfolio. Almost every *noun* it needs already spawns. What does not exist is any fact that
makes those nouns agree — no cause, no exit mode, no elapsed band, no per-zone decay rung, no
reclaimer, no ingress graph. That gap is concentrated in §9 and §10 below, and it is the whole
of the site's proposed build.

---

## 1. Host shells — the thing the transform acts on

| spawnable | roller/table | status | note |
|---|---|---|---|
| Subterranean Crypt (whole-dungeon archetype) | `dungeon-type` — archetype **Subterranean Crypt**, Original Purpose "Burial / Ancestral honor" (`Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Type.md`) | **LIVE** via `rollDungeonWalk` | **21.3 %** of dungeon rolls (`docs/intel/walk-census.md` §2a) — the single largest bucket in the census. The spec argues this is a *Funerary Store host* the transform acts on, not a dormancy state |
| Sunken Estate | `dungeon-type` — archetype **Sunken Estate**, Original Purpose "**Manor house / Basement levels**" | **LIVE** | **10.3 %** of dungeon rolls. The Original Purpose column has already committed to the below-grade half being the playable half — the SUBTRACTIVE-SURVIVES law is in the table |
| Ruined Quarter (urban district) | `urban-type` (`src/engine/walk.js`) | **LIVE** | 9.3 % of urban rolls; the urban expression of the transform |
| Every other host archetype the transform can act on | `dungeon-type` (Military Fortification, Infrastructure Hub, Religious Sanctuary, Prison/Asylum, Laboratory/Workshop, Natural Cavern, Living Hive, Megastructure) | **LIVE** | The transform's whole claim is that it works over all of these with no host-specific branch |
| Building shells and typed kits | `building-interior`, `data/building-kits.js`, `place-spine`, `data/place-skins.js` | **LIVE** per the roller ledger | The above-ground dormant host, including the manor for `DA-SEED-01` |
| A ruined built structure standing *inside* a natural void | `dungeon-area-type` rows **130** ("20'×20' collapsed dungeon structure sitting partially intact on the cave floor; crumbling walls still 8 ft high") and **140** ("20'×30' ruined dungeon structure … walls still 10 ft high") | **LIVE** | The Site 3 × Site 7 seam, already authored *with heights* |
| Wilderness ruin/barrow features | `wilderness-feature` (d300) via `src/engine/wild-walk.js` | **LIVE** | 55 of the 177 golden-site-mapped wilderness features fell to Site 3 — the largest share — but that mapping is a **disclosed keyword heuristic**, not a founder ruling (walk-census §4 caveat 5) |

---

## 2. Decay-ladder geometry (rungs D0–D5)

| spawnable | roller/table | status | note |
|---|---|---|---|
| Collapsed section that narrows or blocks a route | `dungeon-area-type` rows **004** ("10'×10' collapsed section at the midpoint; rubble narrows the passage to 3' for 5 feet"), **034** ("collapsed section in the SE corner blocks the eastern exit to 5' width"), **057** ("10'×10' collapsed wall section opening into a natural rock pocket") | **LIVE** | The breach-and-blockage pair, already dimensioned. Rung D3 |
| Rubble spill / collapse heap | `dungeon-feature` rows **02** ("A collapsed arch spills rubble across the floor" — 5'×15', 3' high, difficult terrain, half cover), **06** ("A ceiling collapse forms a jagged mound" — 10'×10', 5' high, **top grants elevation for ranged attacks**) | **LIVE** | This *is* the site's deck. The elevation-granting clause is already in the table |
| Rubble ramp (the climbable cone) | `dungeon-feature` row **09** ("Rubble forms a narrow, unstable ramp" — 3' wide, 8' long, rises 5'; climbable, DC 12 Acrobatics at speed) | **LIVE** | Causal geometry: the ramp exists because the hole does. Nothing currently *checks* that a source hole exists above it |
| Unstable rubble mound (hazardous) | `dungeon-feature` row **05** (5'×5', 4' high; DC 10 Dex or it collapses for 1d6) | **LIVE** | |
| Wall gap with a climbable rough face | `dungeon-feature` row **04** ("A shattered wall exposes rough inner stone" — 10' wide gap, rubble spill at base; passage open, rough face climbable) | **LIVE** | The breach as a *route*, already priced |
| Failed shoring | `dungeon-area-type` row **136** ("Reinforced Cave … 5'×10' collapsed section where shoring has failed") | **LIVE** | Support failure as a located, causal event |
| Collapsed flue / hearth surviving its building | `dungeon-area-type` rows **065**, **075** ("fireplace built into one wall, flue collapsed, ash still present") | **LIVE** | Matches image DA-3 exactly: the hearth is the last surviving fixture |
| Collapsed railing / partial deck loss | `dungeon-area-type` row **179** ("Gallery Overlook … stone railing, two sections collapsed") | **LIVE** | Selective damage on an elevated deck |
| Collapsed bridge, four variants | `dungeon-feature` rows **106–109** (15'–20' gaps, stub remnants, 30° decline, lengthwise fracture with per-5' stability) | **LIVE** | |
| Collapsed stair | `dungeon-area-type` row **019** ("side gallery … elevated 5 ft above the corridor floor; collapsed wooden stair") | **LIVE** | Timber goes first — the material-durability law, authored |
| Ragged wall-head profile (D2/D3 silhouette) | — | **NO-TABLE-YET** | A displaced top edge on an existing wall run. The single most recognisable ruin cue in image DA-2 and the cheapest piece of geometry in the site |
| Roof/floor **scar band** | — | **NO-TABLE-YET** | Horizontal decal at every removed structural level (image DA-3). One decal role does the whole "there used to be a floor here" job |
| Wall stub run at 0–1 h (rung D4 half cover) | — | **NO-TABLE-YET** | The hardest tactical consequence in the site: below ~1 m the interior stops being an interior |
| Earthwork height-field (rung D5) | — | **NO-TABLE-YET** | Platforms, banks, hollow-ways, robbing pits. Terrain, not props |
| Differential-deposit ground layer (what makes D5 readable) | — | **NO-TABLE-YET** | Snow/water/frost/moss in the low ground (image DA-7). Free, motivated, and it draws the plan by itself |
| Rubble apron / spread as ground material | — | **NO-TABLE-YET** | "Geometry where it is a route, paint where it is only a look" (FFT lane FD-3) |

---

## 3. Vector: SEALED (deliberate closure)

| spawnable | roller/table | status | note |
|---|---|---|---|
| Intact heavily-locked vault door | `dungeon-area-type` row **167** ("main vault door is iron-banded stone, three locks, all intact") | **LIVE** | |
| Concealed door / false-tomb access panel | `dungeon-area-type` row **157** ("false tomb trap-room attached by a concealed door; the main sarcophagus is a hinged access panel") | **LIVE** | The tomb's "getting in is the level" inversion, authored |
| Secure floor vault with iron hatch | `dungeon-area-type` row **078** ("10'×10' secure vault recessed into the floor; iron hatch, triple-locked") | **LIVE** | |
| Door state (stuck, barred, sealed…) | `dungeon-door-state` (d20) | **REFERENCE VERIFIED, CALLER UNCONFIRMED** | Referenced in `src/world/wiring-b.js`; the player-facing caller path was **not** confirmed this pass. **The spawn-audit lane should resolve this before anyone calls it live** |
| Exit state | `dungeon-exit-state` (d100) | **LIVE** via `rollDungeonWalk` | |
| **Blocking panel** (cheaper, later masonry filling a finer, earlier opening) | — | **NO-TABLE-YET** | Image DA-8, and the tell that separates *reduced* from *ruined*. A flat infill in an existing opening socket with its own material card. Highest value-per-cost item in the entire inventory |
| Capped shaft / grille / backfill plug | — | **NO-TABLE-YET** | The industrial closure vocabulary (care-and-maintenance, decommissioning, shaft backfill) |
| Termination-deposit anchor (ritual closure) | — | **NO-TABLE-YET** | Burnt offering, valuables placed on a floor, a deliberately smashed vessel set. Culture's strongest cheap signature |
| Closure marks, warnings, memorials | `dungeon-art-motif` + `dungeon-art-motif-modifier`; `dungeon-lore-art` | **LIVE, but generic** | These roll *motifs*, not *closure acts*. A closure mark is a distinct semantic role |

---

## 4. Vector: FLOODED / water

| spawnable | roller/table | status | note |
|---|---|---|---|
| Flooded chamber with a dry island | `dungeon-area-type` row **182** ("2 ft of standing water throughout; 10'×10' elevated dry platform in one corner, 3 ft above floor level") | **LIVE** | Datum plus dry island, already dimensioned and already sitting on the `h = 2.5 ft` quantum comfortably |
| Sump dropping to a flooded lower chamber | `dungeon-area-type` row **125** ("5'×5' side sump dropping into a flooded lower chamber; faint echo of dripping water below") | **LIVE** | The water datum sorting the site by height |
| Sunken floor / pool / font / basin | `dungeon-area-type` rows **033**, **061**, **090**, **101**, **104** | **LIVE** | Rolled sunken volumes the water vector can occupy |
| Stagnant pool | `dungeon-feature` rows **47**, **50** (10'×10' and 10'×15', 1' deep; difficult terrain; unknown floor condition) | **LIVE** | |
| Drainage grate with a drop to a live channel | `dungeon-feature` rows **67**, **69**, **72** (5'×5' and 3'×3' openings; 10–15 ft drop; "possible exit if widened") | **LIVE** | Row 69's "possible exit if widened" is a **reactivation verb already authored** |
| Flash flood from a crack failure | `dungeon-hazard` row **15** ("Mechanism or crack failure; sudden roar as warning"; 20' corridor, 3' surge) | **LIVE** | |
| Waterlogged object condition | `dungeon-set-dressing-condition` rows **11–14** (algae smear, swollen seams, salt crust, mud-caked with a continuing drip) | **LIVE** | |
| **Water datum as a committed site fact** (one dead-level surface per connected body, with source and destination) | — | **NO-TABLE-YET** | Today water is per-room dressing. There is no fact that says two flooded rooms share a level |
| **Waterline band** (material change at the datum) | — | **NO-TABLE-YET** | Image DA-13. The cheapest and most legible decal law in the packet |
| Drawdown as a state change the player can cause | — | **NO-TABLE-YET** | Plan C of the Golden Seed depends entirely on this |

---

## 5. Vector: OVERGROWN / BURIED / reclamation

| spawnable | roller/table | status | note |
|---|---|---|---|
| Natural overgrowth claiming a corner | `dungeon-empty-result` row **8** ("Pale lichen or vines claim the corner … nature sign points toward water/airflow/hidden cavity") | **LIVE** | And it already carries a *route hint*, which is exactly the ecology-as-information reading |
| Slick lichen floor | `dungeon-hazard` row **5** (10'×15' floor section; DC 12 Acrobatics or prone) | **LIVE** | |
| Yellow mold | `dungeon-hazard` row **27** (5'×5' ceiling or wall patch) | **LIVE** | |
| Roots punching through from the surface | `dungeon-type` Natural Cavern atmosphere rows | **LIVE, atmosphere only** | Narration, not geometry |
| Draft of fresh air implying a crack to the surface | `dungeon-empty-result` row **6** ("a faint breeze suggests a crack or route"; next secret-route reveal gets advantage) | **LIVE** | An aperture's *sensory tell*, already wired to a mechanical benefit |
| **Succession stage index tied to substrate role** (ledge → joint → floor → canopy) | — | **NO-TABLE-YET** | Image DA-4. Overgrowth is currently an intensity flavour, not a timed sequence with a substrate preference |
| **Vegetation emitted from the wall graph** (hedge/scrub following the plan) | — | **NO-TABLE-YET** | Image DA-5. Nearly free, and the most convincing "this was a place" cue in the whole packet |
| Silt / spoil / sand / ash fill volume (BURIED) | — | **NO-TABLE-YET** | Reduces headroom, seals lower volumes, preserves what it covers |

---

## 6. Vector: ROBBED / tampering / the people who came after

| spawnable | roller/table | status | note |
|---|---|---|---|
| **Tampered** object condition | `dungeon-set-dressing-condition` rows **18** ("Retied/rebolted/resealed — tool marks are fresh") and **19** ("Staged as a marker: placed to be noticed (or to mislead)") | **LIVE** | The engine already models *someone came back and interfered*. Row 19 even models deliberate misdirection |
| Sarcophagus with chisel marks suggesting recent tampering | `dungeon-feature` row **57** (lid loose, DC 8 Str to open) | **LIVE** | |
| Hastily looted treasury | `dungeon-area-type` row **168** ("inner room shows signs of hasty looting") | **LIVE** | Exit mode expressed as evidence |
| Loose masonry hiding something | `dungeon-empty-result` row **18** | **LIVE** | |
| Refuse pile with a hideable crate interior | `dungeon-feature` row **31** (10'×5', 3' high; crate interior can hide a Small creature) | **LIVE** | |
| Abandoned debris yielding mundane supply | `dungeon-empty-result` row **7** ("Broken wood, rusted iron, old rope … gain 1 mundane supply") | **LIVE** | De facto refuse, already yielding a mechanical benefit |
| **Robbers' cut / tunnel** (narrow, unlined, off-grammar, capacity-limited, often one-way) | — | **NO-TABLE-YET** | The strongest strategic asset in the site: a second route that comes free with any robbed tomb, and whose existence is itself information |
| **Robbed-element negative** (a socket whose dressed stone is gone; a lintel-less opening that then failed) | — | **NO-TABLE-YET** | Robbing leaves a *negative* trace, and it inverts the survivability order |
| Robbing crew mid-extraction, with a cart and a route out | — | **NO-TABLE-YET (composable)** | Composable from `dungeon-contact` / `dungeon-threat-identity-t1/t2` / NPC role tables, but nothing currently ties an occupant to a *material extraction goal and an exit route* |

---

## 7. Funerary content (the 21.3 % bucket)

| spawnable | roller/table | status | note |
|---|---|---|---|
| Crypt room with tiered sarcophagi and a charnel alcove | `dungeon-area-type` row **156** ("30'×40'; 10'×20' charnel alcove at the far end; **twelve stone sarcophagi set into the walls in two tiers**") | **LIVE** | This is the loculus-tier grammar from image DA-10, already authored — the tiering, the wall-set placement, and the bulk-deposit alcove at the terminus |
| Tomb room with a false-tomb trap room | `dungeon-area-type` row **157** | **LIVE** | |
| Crypt hosted *beneath* another host | `dungeon-area-type` row **154** ("Temple … 10'×10' crypt accessed via a floor hatch beneath the altar") | **LIVE** | The undercroft relationship, authored |
| Sarcophagus with six distinct seal states | `dungeon-feature` rows **54–60**: carved lid (300 lbs, DC 15 Str or two people) · **sealed tight with mortar** (DC 12 Str or tools, or 10 damage) · **lid slightly ajar** · **chisel marks / recent tampering** · relief carvings (History DC 14 identifies the occupant) · **cracked corner reveals the interior without opening** · dust thick along the edges ("undisturbed for years at minimum") | **LIVE** | The "one swappable panel per void" state machine from image DA-10 — the engine authored it before the research induced it. Half cover on a 7'×3' footprint, 4' high |
| Vaulted chamber form | `dungeon-area-type` row **107** ("central junction open to a 30' vaulted ceiling; each arm ends in an arched alcove"), row **138** ("Natural Vault") | **LIVE** | |
| **Loculus / niche socket array** (a wall run whose relief is a tiling niche grid, 4–6 tiers) | — | **NO-TABLE-YET** | Row 156 gives *twelve sarcophagi in two tiers*; the catacomb gallery needs the denser, smaller, subtractive version — each socket simultaneously cover, concealment, loot slot, spawn slot and evidence |
| **Ossuary / charnel bulk deposit** (bones as architecture and as inventory) | — | **NO-TABLE-YET** | Row 156 names a charnel alcove but nothing fills it. The overfill endpoint of the funerary workflow |
| **Funerary Store host program** — roles, workflow, capacities, permissions, property flows, failure modes | — | **NO-TABLE-YET** | Founder question Q3-2. Without it, a fifth of all dungeons is generated as a ruin when many of them should be maintained institutions |
| Votive flame owned by a live practice | `dungeon-lighting` | **LIVE, but unowned** | The lighting table produces light; nothing binds a light to an owner, a fuel, or a practice |
| Passage-tomb mound + revetted portal | — | **NO-TABLE-YET** | Image DA-14: terrain with one masonry socket. A wilderness-walk citizen more than a dungeon one |

---

## 8. Light, hazard and atmosphere

| spawnable | roller/table | status | note |
|---|---|---|---|
| Pitch black (four distinct rows) | `dungeon-lighting` rows **45, 46, 49, 52** ("total darkness — sound becomes your map"; "the dark has gradients — barely — like deep water") | **LIVE** | The CAUSAL LIGHT LAW's presentation already exists |
| Light pooling in islands with dark gaps | `dungeon-lighting` row **8** ("Torchlit Warmth: warm light pools in 'islands' between dark gaps") | **LIVE** | The same composition my read of image D5-01 produced independently |
| Hard light cone with velvet dark beyond | `dungeon-lighting` row **35** | **LIVE** | |
| Shadow-heavy / dust-dim | `dungeon-lighting` rows **33, 68, 71** | **LIVE** | |
| Light-Eater Mist (all light reduced to 5 ft dim) | `dungeon-hazard` row **11** | **LIVE** | |
| Brittle masonry ceiling | `dungeon-hazard` row **1** (10'×10' section, 4' drop zone; DC 13 Investigation to notice first) | **LIVE** | |
| **Structural Groan** | `dungeon-hazard` row **7** ("area below unstable ceiling … heavy impact or Thunder damage" → collapse, restrained under rubble) | **LIVE** | **Structural gambling already has its mechanics** |
| Collapsing ceiling (triggered) | `dungeon-hazard` row **22** | **LIVE** | |
| Corrosive seepage / soot-haze | `dungeon-hazard` rows **2, 14** | **LIVE** | |
| Oppressive gloom / damp chill / dust shadows | `dungeon-empty-result` rows **1, 2, 10** | **LIVE** | |
| Sensory: drips, echoes, mineral rot, cold currents | `dungeon-sensory`, `dungeon-type` atmosphere column | **LIVE** | |
| **Aperture** (a hole that is a motivated light source, with a lit island beneath and a dark rim) | — | **NO-TABLE-YET** | Founder question Q3-1. This is the site's answer to "how is a dead room readable without inventing a lamp" |
| **Light owner binding** (every practical light carries owner · fuel · shift · legal condition; the transform deletes the rest) | — | **NO-TABLE-YET** | Named in Site 5's spec too. It is a cross-site gap, not a Site 3 gap |

---

## 9. The residue field — evidence of exit (**entirely NO-TABLE-YET**)

This whole section is the transform's signature information layer, and none of it exists.

| spawnable | roller/table | status | note |
|---|---|---|---|
| **Exit mode** (orderly · hasty · violent · gradual · unfinished · ritual · evicted) | — | **NO-TABLE-YET** | Determines everything below it |
| **Curated-away ledger** (what the leavers took, in anticipation of use elsewhere) | — | **NO-TABLE-YET** | Schiffer's curate behaviour. The mill in image D1-03 has lost all its machinery and kept its shell |
| **De facto refuse** (the heavy, the broken, the worthless-to-carry, left behind) | — | **NO-TABLE-YET, partially served** | `dungeon-empty-result` row 7 and `dungeon-feature` row 31 produce debris, but nothing marks an object as *deliberately left* versus *dropped* versus *never used* |
| **Draw-down** (worn items not replaced in the final period) | — | **NO-TABLE-YET** | The tell of a *gradual* end as opposed to a sudden one |
| Ruined furniture as evidence | `dungeon-area-type` row **148** ("eight ruined bunk frames line the long walls") | **LIVE, as dressing only** | Present; not connected to an exit mode |
| Faded wall markings that reveal original purpose | `dungeon-empty-result` row **5** ("Peeling designs hint at original purpose … gain a minor piece of local lore") | **LIVE** | The "former purpose remains readable" invariant, already rolling on the empty branch (10.0 % of dungeon segments) |
| Inert machinery revealing the dungeon's function | `dungeon-empty-result` row **11** ("Seized gears/pipes/vents … indicates the dungeon's function — water, ventilation, lift, ward system") | **LIVE** | Same |
| Discarded notes revealing a hazard | `dungeon-empty-result` row **15** | **LIVE** | |
| Later graffiti, tallies, and marks from people who came after | — | **NO-TABLE-YET** | Distinct from the host's own decoration; it is chronology made visible |

---

## 10. The coherence facts — the transform itself (**entirely NO-TABLE-YET**)

Nothing in this section exists in any form today. It is the whole of the proposed build, and
it is why a segment can currently produce a freshly-tampered sarcophagus, an intact
triple-locked vault door and a failed shoring set in the same site with nothing connecting
them.

| spawnable fact | status | what it would bias / validate |
|---|---|---|
| **`dormantCause`** (a rolled world/place/host fact, weighted mundane) | **NO-TABLE-YET** | Everything. Without it, invariant 2 is unenforceable |
| **`exitMode`** | **NO-TABLE-YET** | The residue field, §9 entire |
| **`elapsedBand`** (ordinal only — season · years · decades · generations · ancient) | **NO-TABLE-YET** | Rung ceiling, succession stage, condition weights |
| **`zoneRung`** (D0–D5, per zone) | **NO-TABLE-YET** | Which condition rows are legal in which zone; rejection rule 3 (at least two distinct rungs) |
| **`vectorFlags`** | **NO-TABLE-YET** | Which of §§3–6 are in play |
| **`reclaimers`** (transient only) | **NO-TABLE-YET** | Occupancy legality; Site 8 promotion boundary |
| **`ingressGraph`** (original openings · breaches · blockings · robbers' cuts · water routes, each with a capacity) | **NO-TABLE-YET** | Route promises, §6 of the spec; and rejection rule 15 |
| **`loadFlags`** (per structural element; connected, so pulling a member propagates) | **NO-TABLE-YET** | Structural gambling. `dungeon-feature` rows 11/12/16 already carry per-pillar collapse thresholds; nothing connects them |
| **`reactivationVerbs`** | **NO-TABLE-YET** | The site's signature lever. `dungeon-feature` row 69's "possible exit if widened" is the only authored instance |
| **`lightOwners`** (may legally be empty) | **NO-TABLE-YET** | The causal light law, auditably |
| **Delta receipt** (which host facts changed vs the operating state) | **NO-TABLE-YET** | The only thing that can prove the system told a history rather than decorated a ruin |

---

## 11. Cross-walk and world sources this site consumes

| source | status | note |
|---|---|---|
| `dungeon-origin`, `dungeon-topology`, `room-elevation-profile`, `dungeon-environment-skin`, `walk-skin-dungeon` | **LIVE** via `rollDungeonWalk` | The dungeon skin already promises deterioration and control among its axes; the transform must *pay* that promise rather than restate it |
| `urban-set-dressing-condition` | **LIVE** via `src/engine/walk.js` | The urban condition axis for Ruined Quarter |
| `wilderness-set-dressing-condition`, `wilderness-sign-of-passage` | **LIVE** via `src/engine/wild-walk.js` | Sign-of-passage is a ready-made "who came through since" roller |
| `place-drift` | **LIVE** via `src/world/turn.js` | Places already change over time; dormancy should be an outcome the drift can *reach*, not a separate system |
| `place-history`, `place-secret` | **ORACLE-MANUAL** (consumed by `src/engine/codex-roll.js`) | Strong cause material sitting on the codex path rather than the walk path |
| `T.master`, `T.arch`, `T.pressure`, `T.faction`, `T.nearby`, `T.taboo`, `T.myth` | **LIVE** | Cause, closure culture, and the counterparty who benefited |
| `dungeon-secret-type`, `art-condition` (d100, 100 rows) | **AUTHORED-UNWIRED** | Present only in generated indexes. `art-condition` in particular is a 100-row condition table nobody calls — worth the spawn-audit lane's attention |
| `urban-area-type` (Suspended Cage, Prison Block, Catwalk Maze, and many institutional rooms) | **AUTHORED-UNWIRED** for `rollUrbanWalk` per the roller ledger | Do not claim these spawn today |

---

## 12. Summary for the spawn-audit lane

| bucket | LIVE | AUTHORED-UNWIRED / unconfirmed | NO-TABLE-YET |
|---|---:|---:|---:|
| host shells | 6 | 1 | 0 |
| decay-ladder geometry | 9 | 0 | 6 |
| SEALED | 4 | 1 | 4 |
| FLOODED | 8 | 0 | 3 |
| OVERGROWN / BURIED | 5 | 0 | 3 |
| ROBBED / tampering | 6 | 0 | 3 |
| funerary | 6 | 0 | 5 |
| light / hazard / atmosphere | 11 | 0 | 2 |
| residue field | 3 | 0 | 5 |
| coherence facts | 0 | 0 | 11 |

**Reading.** Site 3's nouns are largely bought; its *grammar* is entirely missing. Fifty-eight
live spawnables against forty-two gaps, and the gaps cluster almost perfectly into two
buckets: the residue field (§9) and the coherence facts (§10). Those two sections are the
transform. Everything else is bias and validation over content that already spawns.

**Three items the audit lane should chase first, in order:**

1. **`dungeon-door-state`'s caller path** — the only status in this document that is a
   question of fact rather than a question of build order.
2. **`art-condition` (d100, 100 rows)** — a substantial authored condition table with no
   caller. If it is usable, it is the cheapest possible substrate for the per-zone rung.
3. **The blocking panel** — the highest value-per-cost item in the whole inventory: one flat
   infill in an existing opening socket, and it buys chronology, culture, poverty, intent and
   an access change at once.
