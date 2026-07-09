---
id: place-skin-chrome
type: table
domain: Realms / Place Generation
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# Place Skin — Chrome (neon-slum megacity)

> Realm skin over [[place-spine]] ([[PLACE-GEN]] §2, approach C). Chrome is the walled neon-slum
> megacity (The Warriors × Ninja Turtles × RoboCop, serial numbers filed off): subway arteries,
> gang turf marked in paint, corp towers you enter only through the lobby, tunnels and storm
> drains under everything. It **drops** Wild-margin (there is no outside — only lower levels) and
> **adds** the chrome-only shapes: the subway platform, rooftop territory, the charging depot, the
> arcology mezzanine. Turf grammar: districts carry a faction handle by default (PLACE-GEN §2 —
> that default rides `mintDistricts`, unit 6, not this skin). Blank Weight = spine default,
> `0` = drop. Rows PROVISIONAL 2026-07-09 (Fable draft; Adam's craft pass owns final labels).
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Chrome label)

| Archetype key | Chrome label | Weight |
| ---: | --- | ---: |
| 1 · Gathering-place | The 24-hour laundromat | |
| 2 · Watering-hole | The noodle bar under the rail line | 10 |
| 3 · Market | The night market under the overpass | |
| 4 · Seat-of-power | The corp tower lobby, floor 1 of 200 | |
| 5 · Hall-of-law | The precinct house | 4 |
| 6 · Shrine | The street shrine between vending machines | 3 |
| 7 · House-of-healing | The unlicensed clinic over the pawnshop | |
| 8 · Workplace | The sorting floor | |
| 9 · Workshop | The sewer-workshop | |
| 10 · Storehouse | The container stack | |
| 11 · Lodging | The capsule flophouse | |
| 12 · Dwelling | A stacked-block apartment | 8 |
| 13 · Threshold | The turnstile checkpoint on the turf line | 7 |
| 14 · Crossing | The interchange under the elevated | |
| 15 · Hideout | The clubhouse behind the arcade | 6 |
| 16 · Vice-den | The basement fight pit | 4 |
| 17 · Ruin | The condemned block | 6 |
| 18 · Boneyard | The recycler | |
| 19 · Watch-post | The signal tower catwalk | |
| 20 · Wild-margin | — | 0 |
| 21 · Works | The transformer yard | |
| 22 · Commons | The handball courts | |
| 23 · Seat-of-learning | The records annex, sublevel 3 | |
| 24 · Monument | The statue the gangs repaint monthly | |

## Adds (Chrome-only place shapes)

| Key | Place | Weight | Scale | Space | Staff | Cast | Note |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| [ADD] | The subway platform | 6 | site | roomy | 1-3 | authority / margin+criminal | Neutral ground by treaty nobody signed; every gang rides, nobody fights on the platform — usually. |
| [ADD] | Rooftop territory | 4 | site | vast | 0-2 | criminal / criminal+margin | The city above the city: pigeon coops, painted claims, and the fastest routes for those who can jump. |
| [ADD] | The charging depot | 3 | site | roomy | 1-2 | labor / labor+authority | Where the mechs and the fleet drink power; the hum gets into your teeth, and the manifests get into everything. |
| [ADD] | The arcology mezzanine | 2 | site | vast | 2-4 | elite / service+authority | The clean level — planters, security glass, and the exact altitude where the city stops being visible. |
