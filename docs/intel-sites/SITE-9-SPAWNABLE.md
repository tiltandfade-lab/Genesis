STATUS: RECONCILED SOURCE INVENTORY — NO IMPLEMENTATION AUTHORITY (2026-07-28)

---
type: spawnable-inventory
site: 9 — contested fortress (scale/relationship stress case)
created: 2026-07-27
spec: ../SITE-9-CONTESTED-FORTRESS-SPEC.md
research: ../../Reference/Contested-Fortress-Study-0727/
feeds: the spawn-audit lane
---

# SITE 9 — SPAWNABLE CONTENT INVENTORY

## 2026-07-28 adversarial reconciliation

Site 9 owns no fortress or holder generator. It is the stress proof
`Defense/Fortification HostProgram + LayeredControl + persistent MaterializationWindow`.
The holder view is a projection of the shared claimant record. The 14.62% figure measures
Military Fortification host demand, not contested activation. Quiet-largest ground,
enceinte-edge buildings, and multi-barrier/lengthened gates are proof-profile defaults or
window profiles; none is a universal Defense law.

Every concrete thing the Site 9 spec implies can **spawn in play**, mapped to the Engine table
or roller that would produce it — or marked `NO-TABLE-YET`.

## How to read the status column

| status | meaning |
|---|---|
| `LIVE` | a production code path calls this table/roller today; a named caller is cited |
| `AUTHORED-UNWIRED` | the table is compiled and active, but **no caller found in `src/`** — evidence and candidate content, never current behaviour |
| `DERIVED` | not a roll; computed from committed state (e.g. the line derived from two holders' enforcement reach) |
| `NO-TABLE-YET` | nothing produces this; it is new work the site requires |

**Verification method.** Table ids come from each table markdown's own `id:` frontmatter or
from the slug used at the call site. Caller status comes from `grep -rn "<table-id>" src/`.
**`tables.js` / `tables.json` were never read** (settings-denied). **The engine was not
executed** — a dynamic dispatch grep cannot see would be missed, and the roller-preservation
ledger warns that this happens for the walk-skin family. Treat every `LIVE` as "a caller
exists," not as "the result reaches a player surface intact."

**What Site 9 spawns that nothing else does.** Site 9 is a *scale/relationship* stress case,
not a host program. Its distinctive spawnables are **attributed grounds, lines, crossings,
chokepoints, windows and frontiers** — the machinery of who-holds-which-ground. Almost none of
that exists today. The structures column is mostly inherited from Site 1's military-masonry
kit and from live dungeon rooms; **the relationship column is almost entirely
`NO-TABLE-YET`, and that is the honest headline of this inventory.**

---

## 1. The host — how a contested fortress arrives at all

| spawnable thing | producing table / roller | status |
|---|---|---|
| A **Military Fortification** dungeon (15 of 100 rows; **14.62 %** of dungeon walks per `docs/intel/walk-census.md`) | `dungeon-type` — `src/engine/dungeon-walk.js:613`, `walkPick("dungeon-type",1,3)` | `LIVE` |
| Its atmosphere line — "geometric corridors with arrow slits," "defensive chokepoints every few steps," "guard posts overlook empty corridors," "narrow stairwells spiral with discipline" (15 rows, **all interior**) | `dungeon-type` col 3, same call | `LIVE` |
| A broad **fortification-adjacent settlement** screen — fourteen rows, including High-Harrow Gate, Thorngate Keep, The Borrowed Wall, The Garrison-Wife Town, and The Tide-That-Stopped | `place-master-setting` — `src/engine/codex-roll.js:660`; hometown beat `src/creator/bardo.js:14` | `LIVE`; only rows 51 and 71 directly encode the Site-9 relationship |
| A **garrison origin story** — "a mountain pass that had to be guarded, so a garrison went up and a town grew in its shadow" (row 6); "a garrison town that outlived its war and learned to farm" (row 59); "refugees from a war stopped one hard winter" (row 47) | `place-history` — `src/creator/bardo.js` | `LIVE` |
| A **fortress siege ground** exterior frame, 120′ × 130′, central ruined gatehouse 30′ × 25′ × 15′, impact scarring (row 200) | `urban-scene-frame` — `src/engine/walk.js:373` | `LIVE` |
| A **keep courtyard** frame, 80′ × 80′, central parade ground, four 10′-diameter corner towers (row 156) | `urban-scene-frame`, same call | `LIVE` |
| A **siege line as an approach obstacle** — "an active military cordon where the target is under siege or heavy lockdown," with four escalation hooks (row 18) | `urban-segment-approach` — `src/engine/walk.js:121` | `LIVE` |
| The construction material the works are built of | `T.arch` world axis (Living Ironwood, Bone & Sinew, Rough-Hewn Basalt, Fused Glass, Fieldstone & Mortar, …) | `LIVE` |
| A **fortress window set** — several committed windows on one persistent site id | — | `NO-TABLE-YET` |
| Which window of the set the current play needs | — | `NO-TABLE-YET` |

---

## 2. Structures and spatial pieces

Inherits the full Site 1 military-masonry kit; the matrix already assigns Site 9 the
gatehouse, keep storeys, and broken wall + gate (`STRUCTURE-KIT-CATALOG.md` §11).

| spawnable thing | producing table / roller | status |
|---|---|---|
| **Gatehouse room, 20′ × 30′, with a 10′ × 20′ murder-hole gallery on the floor above** (row 195) | `urban-area-type` — **no caller in `src/`**; the roller-preservation ledger independently records this table `AUTHORED-UNWIRED` for `rollUrbanWalk` | `AUTHORED-UNWIRED` ⚠ **highest-value stranded content for this site** |
| **Barbican, 30′ × 40′, with a 10′ × 10′ heavy portcullis control room** (row 196) | `urban-area-type`, same | `AUTHORED-UNWIRED` ⚠ |
| Barracks (172, 041, 084), Armory (167), Kennel (179), attached gatehouse (013), attached armories (017, 114, 129) | `urban-area-type` | `AUTHORED-UNWIRED` |
| Attached gatehouse room with a portcullis slot and rust-seized chains (016) | `dungeon-area-type` — `src/engine/dungeon-walk.js:113` | `LIVE` |
| Twin 10′ × 10′ flanking guard rooms at a corridor's far end (018) | `dungeon-area-type` | `LIVE` |
| Antechamber closing a branch behind an iron portcullis, winch mechanism on the wall (030) | `dungeon-area-type` | `LIVE` |
| Murder-hole slit over a stem entrance / over a ramp approach (006, 031, 044) | `dungeon-area-type` | `LIVE` |
| Arrow-loop niches facing each other in a narrow passage (003); arrow slits at switchback-stair landings (041); arrow slit at a blind-corner bend (012) | `dungeon-area-type` | `LIVE` |
| Armory alcove behind a heavy iron door (020) | `dungeon-area-type` | `LIVE` |
| Elevated 5′ × 10′ blind 10 ft up a wall with iron ladder rungs and an observation window (052) | `dungeon-area-type` | `LIVE` |
| Hidden parallel observation passage with a spy slit / concealed access panel (010, 072) | `dungeon-area-type` | `LIVE` |
| Raised walkway along a wall, 3–4 ft high, iron railing (017, 067) | `dungeon-area-type` | `LIVE` |
| Guard-post remains on a raised platform at a junction (029) | `dungeon-area-type` | `LIVE` |
| Room elevation profile — dais, split-level, terraced, **gallery**, chasm/shaft | `room-elevation-profile` — `src/engine/dungeon-walk.js` (`dwalkElevation`) | `LIVE` |
| Guard Tower Roof, 20′ × 20′, 30 ft drop, **crenellated walls at three-quarters cover** (206) | `urban-scene-frame` — `src/engine/walk.js:373` | `LIVE` |
| Corner Turret Battlement 10′ × 10′, 32 ft drop, limited sightlines (267); Sea Cliff Battlement 25′ × 40′, 60 ft drop (274) | `urban-scene-frame` | `LIVE` |
| Wooden Drawbridge 10′ × 40′, 20 ft drop to moat, chains 5 ft below deck as a swing hazard (224); Drawbridge Approach with chain winch (305) | `urban-scene-frame` | `LIVE` |
| Archway Under Rampart, 10′ × 20′ vaulted, 8′ × 8′ alcove at the far end (303) | `urban-scene-frame` | `LIVE` |
| Siege Bridge 25′ × 80′ with ballista emplacements (236); Siege Tower Framework 20′ × 20′ with exterior ladder rungs, DC 11 Athletics (247) | `urban-scene-frame` | `LIVE` |
| Continuous **enceinte run** with declared thickness, batter, and carriage | Site 1 kit (continuous wall run) — geometry lane, not a table | `NO-TABLE-YET` (as a *contested* run with two declared faces) |
| **Wall-walk as a route** — clear width, two access points, chokepoint | — | `NO-TABLE-YET` |
| **Banquette step** (the two-cover-state section) | — | `NO-TABLE-YET` |
| **Corbelled walk widening / blind arcade under the walk** | — | `NO-TABLE-YET` |
| **Stair head cap** (the walk's defensible access point) | — | `NO-TABLE-YET` |
| **Tower with a walk door pair** (the chokepoint) | — | `NO-TABLE-YET` |
| **Outward tower projection enabling enfilade along the wall face** | — | `NO-TABLE-YET` |
| **Second-rank parapet** (stacked firing levels) | — | `NO-TABLE-YET` |
| **Mural passage / wall-thickness chamber** | — | `NO-TABLE-YET` (the 14.6 % demand's own room, and nothing produces it) |
| **Breach piece** — broken wall + broken gate, exposing the rubble core | — | `NO-TABLE-YET` (shared with Site 3's collapse family) |
| **Precommitted frontier** — the wall's honest continuation out of the window | — | `NO-TABLE-YET` |
| Sally port / postern as a capacity-1 crossing | — | `NO-TABLE-YET` |
| Civil infill quarter pressed against the enceinte (rung D) | makeshift/scavenged vernacular (`STRUCTURE-KIT-CATALOG.md` §11 v6) + Site 10 fabric | `NO-TABLE-YET` (as a *fortress-hosted* quarter) |

---

## 3. Occupants and claimant projections

| spawnable thing | producing table / roller | status |
|---|---|---|
| A named faction with agenda, method, dominance flag, tags and clock | `rollFaction` — `src/engine/world-gen.js:6-8` (`SS.fAgenda`, `SS.fMethod`); ≥1 dominant + rivals at `:25-27` | `LIVE` |
| Faction proximity / relationship to the party | `rollFactionProximity` — `src/engine/world-gen.js:66` | `LIVE` |
| The dug-in dungeon threat identity (Construct Watch, Gnoll Warband, Risen Dead, Cultist Shrine, Beast Den, Vampire Domain, …) | `dungeon-threat-identity-t1` / `-t2` — read via `src/engine/scene-risk.js:97` | `LIVE` |
| The dug-in urban threat identity (Corrupt Guard, Goliath Stronghold, Foreign Spy Network, …) | `urban-threat-identity-t1` / `-t2` — `src/engine/walk.js:581` | `LIVE` |
| Enemy category and composition for a fight on the wall | `dungeon-enemy-category`, `dungeon-enemy-composition` — `src/engine/dungeon-walk.js` | `LIVE` |
| An on-site contact / go-between across the line | `dungeon-contact` (d300) — `src/engine/dungeon-walk.js`; `urban-contact` (d200) — `src/engine/walk.js:350` | `LIVE` |
| Who rules and how securely, plus the live tension in it (100 rows) | `place-ruler-status` via `placeRulerStatusRoll` — `src/world/wiring-b.js:274`, bundled into `placeDepthRoll(w)` at `:285`, invoked once per world at `src/world/play.js:88` | `LIVE` |
| Inter-population relations at a settlement | `place-race-relations` via `placeRaceRelationsRoll` — same `placeDepthRoll` bundle | `LIVE` |
| Nearby places that explain the works' position | `place-nearby` via `placeNearbyRoll` — same bundle | `LIVE` |
| A **Holder view** — a fortress-facing projection of the shared LayeredControl claimant record: `claimTarget`, `claimBasis`, `recognitionProfile`, `enforcementReach`, `dependency`, `tell`, `schedule`, `crossingCost`, `wouldMoveTheLine` | — | `NO-TABLE-YET`; owned by the shared claimant contract, not Site 9 |
| A **second population that is not a threat** — civilians, refugees, dependents, tenants inside the works | — | `NO-TABLE-YET` |
| Garrison roster, watch rotation, change of guard | — | `NO-TABLE-YET` (Site 1 names the circuit; no table produces it) |
| The gate crew occupying the machinery room | — | `NO-TABLE-YET` |
| A rent collector for an absent lord | — | `NO-TABLE-YET` (implied by `place-master-setting` row 71's text; not spawnable as an actor) |

---

## 4. The relationship layer — attributed ground, lines, crossings

**This whole table is shared LayeredControl and MaterializationWindow demand, and every row
in it is `NO-TABLE-YET`.** No live table assigns two populations to two regions of one site, and no
live table carries a front, a truce line, an attributed territory, or a crossing cost. Today
that is entirely DM narration.

| spawnable thing | producing table / roller | status |
|---|---|---|
| **Attributed ground** — a named, contiguous, camera-readable region held by one holder | — | `NO-TABLE-YET` |
| **The line** — the boundary where two holders' enforcement reach meets | derived from the holder set (§11.2 of the spec) | `DERIVED`, but its inputs are `NO-TABLE-YET` |
| **The line tell** — chalked/scored line, knee-high rope, changed paving, swept/unswept boundary, laundry on one side, different heraldry at the two ends of one walk, tally marks, unit numbers on casemate doors | — | `NO-TABLE-YET` (proposed decal-bin family, P9) |
| **Crossing cost** per direction | derived from the receiving holder's `crossingCost` field | `DERIVED`, inputs `NO-TABLE-YET` |
| **Committed crossings** — front, alternate (postern / breach / mural passage / ladder point), and a social crossing | — | `NO-TABLE-YET` |
| **Chokepoint** as a first-class reserved cell | — | `NO-TABLE-YET` |
| **Line movement** as a persisted consequence of play | — | `NO-TABLE-YET` |
| A cart / timber barricade across the line (geometry, not decal) | `dungeon-set-dressing` / `urban-interactable-object` row 188 *Abandoned Siege Barricade* (cover + hazard) | `LIVE` for the prop; `NO-TABLE-YET` as a line-defining object |

---

## 5. Barriers, mechanisms and interactables

| spawnable thing | producing table / roller | status |
|---|---|---|
| Per-exit door type + door state pair | `dungeon-door-type` + `dungeon-door-state` via `dwalkDoorRoll` — `src/world/wiring-b.js:384`, called at `src/engine/dungeon-walk.js:659` | `LIVE` |
| Exit state (blocked, guarded, etc.) | `dungeon-exit-state` — `src/engine/dungeon-walk.js` | `LIVE` |
| Room interactable objects | `dungeon-interactable-object` — `src/engine/dungeon-walk.js` | `LIVE` |
| Broken ballista (5′ × 10′) giving three-quarters cover and blocking a 10 ft choke (row 126); broken siege tower (15′ × 15′ × 20′) with interior ladders to a 20 ft perch (row 157) | `wilderness-interactable-object` | `LIVE` on the wilderness path |
| Rusted inoperable catapult/trebuchet, 15′ × 15′ × 10′ high, total cover (row 102); ruined trebuchet arm climbable to a sniper perch (row 259) | `wilderness-feature` | `LIVE` on the wilderness path |
| Abandoned siege barricade (cover / hazard / obvious / mundane) | `urban-interactable-object` row 188 | `LIVE` |
| Fortified gate plaza tactical setup — barricade at a street entrance, defenders on a 20 ft wall above, heavy defender cover, siege timing matters, mounted charge blocked (row 11) | `urban-tactical-setup` — `src/engine/walk.js:504` | `LIVE` |
| Guard tower interior tactical setup — spiral stairs, arrow slits as defender cover, confined floors, bell-rope alarm hazard, multiple levels, siege ladder at the base (row 19) | `urban-tactical-setup` | `LIVE` |
| **Multi-barrier gate passage** — two or more independently operable barriers in one opening, each with its own state | — | `NO-TABLE-YET` (`dungeon-door-*` gives one barrier per exit, not a sequence) |
| **Portcullis slot + winch/lever position** as an occupiable interaction | — | `NO-TABLE-YET` (the geometry exists in `urban-area-type` 196's control room; the mechanism does not) |
| **Murder-hole gallery sight relation** (down into the passage below) | — | `NO-TABLE-YET` |
| **Postern bar** (openable from one side only) | — | `NO-TABLE-YET` |
| **Sluice / water control** as a strategic objective | — | `NO-TABLE-YET` |
| **Signal between towers** | — | `NO-TABLE-YET` (Site 1 names the circuit) |
| **Manned/unmanned loop light state** as free information | — | `NO-TABLE-YET` (derivable from light owners once they exist) |

---

## 6. Props, dressing and evidence

| spawnable thing | producing table / roller | status |
|---|---|---|
| Room set dressing + its condition | `dungeon-set-dressing`, `dungeon-set-dressing-condition` — `src/engine/dungeon-walk.js` | `LIVE` |
| Dressing mega-table results | `dungeon-dressing-mega-table` | status not verified in `src/` this pass — **treat as unverified** |
| Sensory layer (sound, smell, air) | `dungeon-sensory` — `src/engine/dungeon-walk.js` | `LIVE` |
| Art motif + modifier on the works | `dungeon-art-motif`, `dungeon-art-motif-modifier` | `LIVE` |
| Environment skin | `dungeon-environment-skin` — `src/engine/dungeon-walk.js`; `urban-environment-skin` | `LIVE` |
| Rusted weapon racks, ration crates collapsed in corners, map tables rotting under damp stone, regimented boot prints, iron struts (from the Military Fortification atmosphere rows) | `dungeon-type` col 3 | `LIVE` as *text*; **no prop spawn** — `NO-TABLE-YET` as objects |
| Loot found in a fortification | `dungeon-loot-*` family — `src/engine/dungeon-walk.js` | `LIVE` |
| **Heraldic cloth** — banners, shields, hung standards (the identity buy at gates) | — | `NO-TABLE-YET` as an occupancy-swappable decal family |
| **Washing lines, cook fires, stacked fuel** in the colonised ward | — | `NO-TABLE-YET` |
| **Slighted-fracture surface** as a damage family distinct from decay | — | `NO-TABLE-YET` (material lane) |
| **Exposed rubble core at a breach** | — | `NO-TABLE-YET` (material lane) |
| **Battered/sloped outer face** as a surface distinct from the inner face | — | `NO-TABLE-YET` (material lane) |

---

## 7. Situations and hooks

| spawnable thing | producing table / roller | status |
|---|---|---|
| Encounter branch for a segment (Enemy / Social / Problem / Hazard / Discovery / Lore / Empty) | `dungeon-encounter-type` — `src/engine/dungeon-walk.js` | `LIVE` |
| A problem to solve in a room | `dungeon-problem` — `src/engine/dungeon-walk.js` | `LIVE` |
| A hazard | `dungeon-hazard` — `src/engine/dungeon-walk.js` | `LIVE` |
| A wall section collapses and enemies are gathering outside; the city is in active siege preparation (row 140) | `urban-catalyst` — `src/engine/walk.js:577` | `LIVE` |
| A mob storming the gates with rams and climbing equipment (row 79) | `urban-spectacle` — `src/engine/walk.js:362` | `LIVE` |
| The war room / siege engine vault / condemned watchtower with wall-rampart and siege-tunnel exits | `urban-segment-inner` (rows 11, 18), `urban-segment-hub` (row 18) — mapped at `src/engine/walk.js:121-122` | `LIVE` |
| Discovery form + content; lore; revelation; narrative device; secret tier and reveal type | `dungeon-discovery-form`, `dungeon-discovery-content`, `dungeon-lore-content`, `dungeon-revelation`, `dungeon-narrative-device`, `dungeon-secret-tier`, `dungeon-secret-reveal-type` | `LIVE` |
| Rest complications inside the works | `dungeon-rest-complications` — `src/engine/dungeon-walk.js` | `LIVE` |
| Reinforcements arriving | `dungeon-reinforcements` | status not verified in `src/` this pass — **treat as unverified** |
| **Arrival hook specific to a contested envelope** — the line has moved since your map was drawn · a body on the wrong side · the gate crew changed overnight · rations short and the count wrong · someone building in the killing ground · a parley due and one side absent · a breach nobody is repairing · a postern found unbarred · a banner that shouldn't be flying · a signal answered from the wrong tower · a rent collector at a wall whose lord is dead · a refugee column and a garrison saying no | — | `NO-TABLE-YET` ⚠ (the arrival-hook law is inherited from Site 1 and Site 1's own hook set is likewise untabled) |
| **Parley / truce / handover** as a scheduled situation | — | `NO-TABLE-YET` |
| **Aftermath propagation** — a moved line persists and both holders act on it | — | `NO-TABLE-YET` |

---

## 8. States

| spawnable thing | producing table / roller | status |
|---|---|---|
| Walk skin: pressure, activity, deterioration, **control**, strangeness | `walk-skin-dungeon` via dynamic `rollWalkSkin` dispatch — recorded `LIVE` in `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md`; **grep for the literal slug in `src/` returned nothing**, which the ledger explicitly warns about for this family | `LIVE` (ledger authority; slug unverified by grep) |
| Lighting state of a room | `dungeon-lighting` — `src/engine/dungeon-walk.js` | `LIVE` |
| Settlement trait + current calamity | `place-traits` — `src/engine/codex-roll.js` | `LIVE` |
| Ruler status and its live tension | `place-ruler-status` | `LIVE` |
| **line:** settled / drifting / disputed / open-conflict / resolved | — | `NO-TABLE-YET` |
| **claims:** one / two / three-or-more | — | `NO-TABLE-YET` |
| **population mix:** garrison-only / garrison+civil / civil-only / garrison+refuge / abandoned-with-claimants | — | `NO-TABLE-YET` |
| **barrier:** open / controlled / closed / breached / jammed | partially served by `dungeon-door-state` per exit | `NO-TABLE-YET` as a per-barrier sequence state |
| **walk control:** single / split / contested / impassable | — | `NO-TABLE-YET` |
| **stores:** full / rationed / short / spoiled / seized | — | `NO-TABLE-YET` |
| **water:** secure / contested / cut / flooded | — | `NO-TABLE-YET` |
| **condition:** maintained / patched / strained / breached / slighted | — | `NO-TABLE-YET` |
| **authority:** present / delegated / lapsed / absent / disputed | partially implied by `place-ruler-status` rows | `NO-TABLE-YET` as a factored axis |
| **outside:** clear / watched / invested / assaulting / withdrawn | — | `NO-TABLE-YET` |

---

## Counts and the honest headline

| section | rows | `LIVE` | `AUTHORED-UNWIRED` | `DERIVED` | `NO-TABLE-YET` |
|---|---:|---:|---:|---:|---:|
| 1. Host | 9 | 7 | 0 | 0 | 2 |
| 2. Structures | 27 | 13 | 3 | 0 | 11 |
| 3. Occupants | 14 | 9 | 0 | 0 | 5 |
| 4. Relationship layer | 8 | 0 | 0 | 2 | 6 |
| 5. Barriers and mechanisms | 15 | 8 | 0 | 0 | 7 |
| 6. Props and dressing | 12 | 6 | 0 | 0 | 5 (+1 text-only, +1 unverified) |
| 7. Situations and hooks | 12 | 8 | 0 | 0 | 3 (+1 unverified) |
| 8. States | 15 | 4 | 0 | 0 | 11 |
| **total** | **112** | **55** | **3** | **2** | **50** |

**The headline.** Roughly half of what Site 9 implies already spawns — and it is all the
*host* half: fortification dungeons, guard rooms with portcullis slots, murder-hole slits,
arrow-loop niches, crenellated tower roofs at three-quarters cover, drawbridges with swing
hazards, fortified gate plazas, factions, threat identities, ruler status, settlements built
around walls. The engine is already generous about fortresses.

**The other half is shared relationship/window machinery, and none of it exists.** Attributed
ground, the line, the line tell, crossing costs, committed crossings, chokepoints, claimant
records, the second non-hostile population, and the state axes are `NO-TABLE-YET`. Site 9 is
where the portfolio proves those shared contracts across a Defense host and multiple windows;
it does not privately own them.

**Three flags for the spawn-audit lane:**

1. ⚠ **`urban-area-type` rows 195 and 196** — a gatehouse with a murder-hole gallery, and a
   barbican with a portcullis control room — are the two most Site-9-specific room programs in
   the whole engine, and **nothing calls them.** Wiring them is cheaper than authoring them and
   is proposed as rung A's implementation (spec §8.3, P12).
2. ⚠ **The shared claimant record has no field that any table produces.** The Holder view's
   nine fields have zero coverage. This is LayeredControl work exercised by Site 9, not a
   Site-9-only invention.
3. ⚠ **The Military Fortification atmosphere rows describe props that cannot spawn.** "Rusted
   weapon racks line the walls," "ration crates collapsed in corners," "map tables rot beneath
   damp stone" are `LIVE` as *text* and absent as *objects*. That gap is small, concrete, and
   exactly the kind of thing a spawn audit should close.

**Caveats carried forward.** `tables.js`/`tables.json` were never read. The engine was not
executed. Two rows are marked *unverified* rather than guessed. `walk-skin-dungeon` is recorded
`LIVE` on the roller-preservation ledger's authority even though the literal slug does not
grep in `src/` — the ledger warns that dynamic walk-skin dispatch is invisible to exactly this
method, and the ledger wins.
