---
id: place-skin-gloom
type: table
domain: Realms / Place Generation
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# Place Skin — Gloom (the town that made a deal)

> Realm skin over [[place-spine]] ([[PLACE-GEN]] §2, approach C). Gloom is Derry: mundane
> small-town American forms — diners, realty offices, a public library, a bandstand — every one
> of them *wrong underneath*, because the town made a deal and everyone's grandparents know it.
> **Nothing drops**; everything reskins to the suburb's shadow. Adds: the standpipe, the
> fairground that shouldn't still be operating, the barrens. Gloom mints bias `place-secret`
> draws upward (PLACE-GEN §2 — that bias rides the engine, not this skin). Blank Weight = spine
> default, `0` = drop. Rows PROVISIONAL 2026-07-09 (Fable draft; Adam's craft pass owns final
> labels).
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Gloom label)

| Archetype key | Gloom label | Weight |
| ---: | --- | ---: |
| 1 · Gathering-place | The barbershop | |
| 2 · Watering-hole | The diner that closes at 9 sharp | |
| 3 · Market | The Main Street grocery | |
| 4 · Seat-of-power | The realty office that owns the town | |
| 5 · Hall-of-law | The sheriff's office and the two cells | |
| 6 · Shrine | The white-steeple church | |
| 7 · House-of-healing | The clinic on Center Street | |
| 8 · Workplace | The mill that still employs half the town | |
| 9 · Workshop | The repair shop that fixes anything, no questions | |
| 10 · Storehouse | The self-storage lot by the highway | |
| 11 · Lodging | The motel off the county route | |
| 12 · Dwelling | A house with the porch light always on | |
| 13 · Threshold | The town-limits sign nobody walks past at night | |
| 14 · Crossing | The four-way stop where the routes meet | |
| 15 · Hideout | The clubhouse under the bridge | |
| 16 · Vice-den | The roadhouse outside town limits | |
| 17 · Ruin | The house everyone knows not to buy | 7 |
| 18 · Boneyard | The old cemetery the kids dare each other into | 4 |
| 19 · Watch-post | The fire lookout on Miller Hill | |
| 20 · Wild-margin | The treeline where the yards give out | 6 |
| 21 · Works | The pump station | |
| 22 · Commons | The town green and its bandstand | |
| 23 · Seat-of-learning | The public library | 5 |
| 24 · Monument | The bronze founder nobody researched | |

## Adds (Gloom-only place shapes)

| Key | Place | Weight | Scale | Space | Staff | Cast | Note |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| [ADD] | The standpipe | 3 | site | cramped | 0-1 | any / margin | The waterworks tower everything in town drinks from; the door has been painted shut for thirty years and the paint is fresh. |
| [ADD] | The fairground that shouldn't still be operating | 2 | site | vast | 2-4 | trade / margin+criminal | Off-season, every season — and yet the lights run and somebody takes tickets. |
| [ADD] | The barrens | 4 | site | vast | 0-1 | wild / margin | The scrubland where the town dumps what it doesn't discuss; things lost there stay lost, mostly. |

## Name patterns

- <Family>'s <label>
- The <label> on <Street>
- The old <Family> place
- <Town> <label>
