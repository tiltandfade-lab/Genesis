STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

---
type: research-note
study: CONTESTED-FORTRESS-STUDY lane 4
status: EVIDENCE GATHERED 2026-07-27 — nothing here is ruled
method: table markdown read directly; wiring verified by grepping `src/` for the roller call.
  The engine was NOT executed. A slug found in `src/` is live on that path; a slug not found
  is reported as unverified, never as absent.
---

# Lane 4 — What the live engine already rolls toward Site 9

Guidelines step 0 requires this pass before a hero composition is chosen. The classification
vocabulary is the roller-preservation ledger's: `LIVE`, `LIVE-COMPOSED`, `AUTHORED-UNWIRED`,
`ORACLE-MANUAL`, `INTERPRETIVE`, `TARGET-ADAPTER`.

---

## 1. The demand, counted

| source | measure | number |
|---|---|---|
| `docs/intel/walk-census.md` §2a | Military Fortification as a share of dungeon `setup.type` (n = 253 real walks) | **14.62 %** — third of ten, behind Crypt (21.3 %) and Cavern (20.6 %) |
| `Engine/…/Dungeons/Dungeon Type.md` | rows carrying the Military Fortification archetype, of 100 | **15 / 100** |
| `Engine/…/Place Generation/Master Setting.md` | rows whose settlement **is** a fortification or is defined by one, of 100 | **13 / 100** (enumerated in §3) |
| `docs/intel/marathon-spatial-mining.md` | Site 9 appearances across 11 marathon transcripts | **0** |

Two independent live tables converge on roughly one place in seven. The marathon says zero,
which is a real and awkward counter-datum: over eleven transcripts of actual play, no scene
read as a fortress. The honest reading is that **the tables offer fortifications at ~14 % and
the play sample did not take them** — which is evidence about sample size and about DM
behaviour, not proof the demand is absent, but it must not be waved away.

## 2. The demand is for an INTERIOR

This is the lane's most consequential finding and it reshapes the site.

`Dungeon Type.md` rows 41–55 are the Military Fortification block. Their sub-archetype is
**"Defensive bunker / Outpost"** and their atmosphere lines are, verbatim:

> Geometric corridors with arrow slits · Barracks cramped and orderly · Rusted weapon racks
> line the walls · Strategic sightlines dominate each chamber · Defensive chokepoints every
> few steps · Floor marked by regimented boot prints · Walls reinforced with iron struts ·
> Ration crates collapsed in corners · Functional, cramped, and coldly efficient · Guard
> posts overlook empty corridors · Map tables rot beneath damp stone · Defensive
> emplacements carved into rock · Reinforced doors hang off hinges · Utilitarian and stripped
> of ornament · Narrow stairwells spiral with discipline

Not one of those fifteen rows describes a curtain wall, a courtyard, a gate, a tower seen
from outside, or a siege. **All fifteen describe corridors, chambers, stairs and rooms.**
The 14.6 % arrives through the *dungeon walk*, and what it asks for is a fortification
**interior**: sightline-dominated corridors, chokepoints, barracks, stores, a command room.

`Dungeon Type` is `LIVE` — `engine/dungeon-walk.js:613`, `walkPick("dungeon-type",1,3)`.

That is exactly the FFT Bethla finding (lane 3) arriving from the other direction: the
fortress is played as named interior windows.

## 3. The settlement roller already builds contested fortresses

`Master Setting.md` (`place-master-setting`, d100, 100 rows) is `LIVE` — rolled by
`engine/codex-roll.js:660` (`rollTable("place-master-setting")`) and by the character-creation
hometown beat at `creator/bardo.js:14`.

Thirteen of its hundred rows are fortification-hosted settlements, and the pattern in their
own text is startling:

| row | setting | the relationship already written into the row |
|---:|---|---|
| 2 | **High-Harrow Gate** — a crumbling grey-stone fortification guarding a mist-shrouded mountain pass | the works outlive their upkeep |
| 6 | **Ash-Hollow** — a scorched hearth-keep, the forest closing in on the ruins | nature as the second claimant |
| 7 | **The Salt-Flat Garrison** — a low-slung sandstone fort on white plains | operating garrison |
| 11 | **The Walled Orchard** — a fortified agricultural estate, the lord protecting rare fruit | fortification serving a non-military program |
| 14 | **Wind-Break Village** — a settlement in the lee of a massive ancient wall of unknown origin | inhabitants who did not build the work and do not understand it |
| 24 | **Shepherd's Tor** — a highland village of drystone walls and lambing pens | the vernacular-earthwork end of the family |
| 29 | **The Caravanserai of Stones** — a walled waystation renting stall-space to a hundred merchants | one enclosure, a hundred tenants |
| 42 | **The Toll-Keep** — a fortified toll point, permanent garrison, permanent grudge | garrison versus everyone who must pass |
| 47 | **The Salt-Road Outpost** — supply depot and garrison on a salt steppe | garrison + dependent traffic |
| 51 | **Thorngate Keep** — a border garrison of stone towers and earthwork ramparts, **now housing a growing civilian quarter inside the old killing ground** | ← **Site 9's promise, already written by the engine** |
| 63 | **Saltpeter Works** — a garrison-adjacent industrial settlement, its reason for existing wholly military | garrison + workforce |
| 71 | **The Borrowed Wall** — **a hamlet sheltering inside the curtain-wall of a castle that was never theirs, paying rent to a lord no living soul has met** | two claims, one enceinte, no violence |
| 79 | **The Garrison-Wife Town** — dependents and camp-followers who outlasted the army, governing by a rank structure with no military left to justify it | the second population is now the only population |
| 93 | **The Tide-That-Stopped** — a coastal town whose walls are frozen water | the anomalous/Site-12 edge of the family |

**Read the column on the right.** The live table's dominant fortress state is not siege. It
is **cohabitation, inheritance, and drift** — someone living inside works they did not build,
under an authority that has lapsed, changed, or gone absent. Rows 51 and 71 are Site 9's
premise stated in a table row.

Corroborating rows in `Place History.md` (`place-history`, `LIVE` via `creator/bardo.js`):
row 6 *"A mountain pass that had to be guarded, so a garrison went up and a town grew in its
shadow"*; row 59 *"A garrison town that outlived its war and learned to farm"*; row 47
*"Refugees from a war stopped one hard winter and never found a reason good enough to leave."*

Confirmed downstream in real character rolls (`docs/intel/tiyl-starts.md`): High-Harrow Gate
rolled as a **hometown** (d100 = 2) with the history *"Settled to contain a thing the founders
couldn't kill; the town is the lid, and the lid is loosening"*; Wind-Break Village rolled as a
**world-origin** (d100 = 39); The Garrison-Wife Town rolled as a **hometown** (d100 = 79).
These are not hypothetical rows; they came back in the twelve-start census.

## 4. Source classification

### `LIVE` — verified by a roller call in `src/`

| source | slug | caller | contribution to Site 9 |
|---|---|---|---|
| Dungeon Type | `dungeon-type` | `engine/dungeon-walk.js:613` | the 14.6 % Military Fortification archetype + its 15 interior atmosphere lines |
| Dungeon Area Type | `dungeon-area-type` | `engine/dungeon-walk.js:113` | 200 room/corridor programs including an **attached gatehouse room with a portcullis slot and seized chains** (016), **twin flanking guard rooms** (018), an **antechamber closing a branch behind an iron portcullis with a wall winch** (030), **murder-hole slits** (006, 031, 044), **arrow slits at switchback landings** (041), an **armory alcove behind a heavy iron door** (020), an **elevated blind with ladder rungs and an observation window** (052), and **hidden parallel observation passages** (010, 072) |
| Room Elevation Profile | `room-elevation-profile` | `engine/dungeon-walk.js` (`dwalkElevation`) | dais, split-level, terraced, gallery, chasm/shaft profiles with fit fallback |
| Dungeon Tactical Terrain | `tactical-terrain` | `engine/dungeon-walk.js:465` | per-room tactical terrain |
| Dungeon Feature / Interactable / Lighting / Exit State / Topology | `dungeon-feature`, `dungeon-interactable-object`, `dungeon-lighting`, `dungeon-exit-state`, `dungeon-topology` | `engine/dungeon-walk.js` | objectives, hazards, props, light, exits, graph shape |
| Dungeon Door Type / State | `dungeon-door-type`, `dungeon-door-state` | `world/wiring-b.js:384` → called at `engine/dungeon-walk.js:659` | per-exit barrier dressing — the raw material of a multi-barrier gate |
| Urban Scene Frame | `urban-scene-frame` | `engine/walk.js:373` | the fortress *exterior* frames, with dimensions — see §5 |
| Urban Tactical Setup | `urban-tactical-setup` | `engine/walk.js:504` | row 11 **fortified gate plaza** (barricade at a street entrance, defenders on a 20 ft wall above, siege timing matters, mounted charge blocked); row 19 **guard tower interior** (spiral stairs, arrow slits giving defenders cover, confined floors, bell-rope alarm hazard, siege ladder at the base) |
| Urban Segment Approach | `urban-segment-approach` | `engine/walk.js:121` | row 18 **The Fortress-Prison Siege Line** — an active military cordon as an *approach obstacle*, with four escalation hooks |
| Urban Catalyst / Spectacle | `urban-catalyst`, `urban-spectacle` | `engine/walk.js:577`, `:362` | catalyst 140 *a wall section collapses; enemies gathering outside*; spectacle 79 *a mob storming the gates with rams and climbing equipment* |
| Master Setting | `place-master-setting` | `engine/codex-roll.js:660`, `creator/bardo.js:14` | the thirteen fortification settlements of §3 |
| Place History / Traits / Nearby | `place-history`, `place-traits`, `place-nearby` | `creator/bardo.js`, `engine/codex-roll.js`, `world/wiring-b.js` | the garrison-origin and outlived-its-war histories |

### `AUTHORED-UNWIRED` — the awkward finding

| source | status | what is stranded |
|---|---|---|
| **Urban Area Type** (`urban-area-type`) | **no caller found in `src/`**; the roller-preservation ledger independently records it as `AUTHORED-UNWIRED` for `rollUrbanWalk` | **row 195 Gatehouse** — 20′ × 30′ with a *10′ × 20′ murder-hole gallery on the floor above*; **row 196 Barbican** — 30′ × 40′ with a *10′ × 10′ heavy portcullis control room*; plus Armory (167), Barracks (172, 041, 084), Kennel (179), attached gatehouse (013), attached armories (017, 114, 129) |

The two most Site-9-specific room programs in the entire engine — a gatehouse with its
murder-hole gallery, and a barbican with its portcullis control room — are **authored and not
rolled by any player-facing path.** They are also, almost exactly, lane 2's B3 (the staffed
portcullis chamber) and lane 3's gate grammar. Somebody already solved this and the wire was
never run.

This is a preservation obligation, not a licence to invent: whatever Site 9 builds must be
able to consume these rows rather than replace them.

### `LIVE-COMPOSED` — already reachable by composition

- **A fortification settlement with a civilian population inside it**: `place-master-setting`
  row 51 or 71 × `place-history` × `T.arch` construction material × occupancy. No new table
  needed; the composition is available today.
- **A fortification interior read as a dungeon**: `dungeon-type` Military Fortification ×
  `dungeon-area-type` gatehouse/guard-room/armory rows × `room-elevation-profile` gallery ×
  `dungeon-door-type`/`-state`. This is the 14.6 % path and it composes today.
- **A siege as an urban approach obstacle**: `urban-segment-approach` 18 × `urban-catalyst`
  140 × `urban-spectacle` 79 × `urban-tactical-setup` 11.

### `INTERPRETIVE`

Everything about **who holds which ground**. No live table assigns two populations to two
regions of one site, and no live table carries a front, a truce line, or an attributed
territory. Today that is entirely DM narration.

### Proposed `TARGET-ADAPTER`

A Site 9 functional grammar that reads existing world/place/dungeon facts into a
**two-population, multi-line control plan** — nested enceintes or a single line with an
inside and an outside, attributed ground on each side, and a front between them. It consumes
the rows above; it does not reroll them.

## 5. The live exterior frames already carry dimensions

`urban-scene-frame` is `LIVE` and its rows carry footprints and heights. The fortress-relevant
rows are real numbers the site should be reconciled against rather than contradicting:

| row | frame | footprint | stated detail |
|---:|---|---|---|
| 156 | **Keep Courtyard** | 80′ × 80′ square | central parade ground; four corner towers, 10′ diameter |
| 200 | **Fortress Siege Ground** | 120′ × 130′ rectangle | central ruined gatehouse 30′ × 25′, 15′ tall; impact scarring |
| 122 | Military Muster Field | 80′ × 100′ | parade ground; four 30′ × 10′ staging areas |
| 164 | Barracks Drill Square | 80′ × 85′ | central 25′ flagpole; formation ground |
| 139 | Border Crossing Plaza | 75′ × 85′ | central checkpoint tower 15′ × 15′ × 20′; four gate houses |
| 206 | **Guard Tower Roof** | 20′ × 20′ | 30′ drop to courtyard; crenellated walls give **three-quarters cover** |
| 267 | Corner Turret Battlement | 10′ × 10′ | 32′ drop; diagonal placement, limited sightlines |
| 274 | Sea Cliff Battlement | 25′ × 40′ | 60′ drop; natural stone giving full cover |
| 224 | Wooden Drawbridge | 10′ × 40′ | 20′ drop to moat; chains 5′ below deck as a swing hazard |
| 236 | Siege Bridge | 25′ × 80′ | 35′ drop; ballista emplacements, cover every 20′ |
| 247 | Siege Tower Framework | 20′ × 20′ | 24′ drop; exterior ladder rungs, DC 11 Athletics |
| 303 | Archway Under Rampart | 10′ × 20′ vaulted | 6′ wide overhead supports; 8′ × 8′ alcove at the far end |
| 305 | Drawbridge Approach | 15′ × 30′ | chain winch mechanism; 4′ drop to water |

Three things fall out:

1. **The engine's existing fortress courtyard is 80′ × 80′** — sixteen five-foot cells square.
   Lane 2's E3 (an empty inner ward) and lane 3's honest-empty-ground finding both say that
   is the right order of magnitude and that most of it should stay empty.
2. **Crenellation is already costed at three-quarters cover** (row 206). Any defensive-edge
   family Site 9 invents inherits that number rather than inventing one.
3. **Vertical drops of 20–60 ft are already normal** in these frames. A fortress that treats
   its wall as a 10-ft ledge contradicts the live table.

## Declared gaps

- **The engine was not executed.** Wiring was verified by grep. A dynamic dispatch that grep
  cannot see would be missed; the roller-preservation ledger warns about exactly this for the
  walk-skin family.
- **No Site 9 world-context receipt exists.** `Reference/Golden-Site-World-Context/ROLL-RECEIPTS.json`
  carries CTX-GP-19, CTX-CAMP-7, CTX-MONASTERY-68, CTX-MINE-39, CTX-LAIR-254, CTX-URBAN-13
  and CTX-PRISON-6198. There is no fortress draw. Site 9 has **no first context proof**, and
  one must be rolled before its context obligations can be written honestly.
- **The 14.6 % is a `setup.type` label**, stamped at walk-assembly time. It is not proof that
  a fortification interior was ever *played*; the marathon's zero hits is the counter-datum.
- **No frequency claim is made for the `place-master-setting` fortification rows in play.**
  Thirteen rows exist; how often they are rolled and reached is uncounted here.
- The `LIVE` column proves a caller exists. It does not prove the result reaches a player
  surface intact — that is the wiring-law distinction, and it was not re-gated in this lane.
