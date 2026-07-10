---
id: place-skin-frontier
type: table
domain: Realms / Place Generation
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# Place Skin — Frontier (weird-west edge of the map)

> Realm skin over [[place-spine]] ([[PLACE-GEN]] §2, approach C). The DEFAULT skin — an unknown
> realm id falls back here at roll time. Frontier is the weird-west edge of the settled world:
> boardwalks over mud, one street that matters, everything built fast out of local timber and
> meant to be defended. Nothing drops; labels lean saloon-and-land-office. Blank Weight = spine
> default, `0` = drop. No `## Name patterns` section — Frontier names ride the existing
> `placeNameDesc` machinery (PLACE-GEN §3.2). Rows PROVISIONAL 2026-07-09 (Fable draft; Adam's
> craft pass owns final labels).
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Frontier label)

| Archetype key | Frontier label | Weight |
| ---: | --- | ---: |
| 1 · Gathering-place | The trading post porch | |
| 2 · Watering-hole | The saloon | |
| 3 · Market | Market day on the main street | |
| 4 · Seat-of-power | The land office | |
| 5 · Hall-of-law | The jailhouse | |
| 6 · Shrine | The plank-board chapel | |
| 7 · House-of-healing | The sawbones' surgery | |
| 8 · Workplace | The stockyards | |
| 9 · Workshop | The smithy | |
| 10 · Storehouse | The freight depot | |
| 11 · Lodging | The boarding house | |
| 12 · Dwelling | A homestead | |
| 13 · Threshold | The town gate palisade | |
| 14 · Crossing | The ford and its toll rope | |
| 15 · Hideout | The dry-gulch camp | |
| 16 · Vice-den | The card room behind the saloon | |
| 17 · Ruin | The burned claim | |
| 18 · Boneyard | Boot hill | |
| 19 · Watch-post | The water tower platform | |
| 20 · Wild-margin | The scrubline past the last fence | |
| 21 · Works | The mill by the creek | |
| 22 · Commons | The wagon yard | |
| 23 · Seat-of-learning | The assay-and-records office | |
| 24 · Monument | The founders' obelisk | |

## Adds (Frontier-only place shapes)

| Key | Place | Weight | Scale | Space | Staff | Cast | Note |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| [ADD] | The stagecoach relay | 3 | site | roomy | 1-2 | trade / service+margin | Fresh horses, old news, and everyone who is leaving or arriving passes through its yard. |
| [ADD] | The hanging tree | 1 | site | roomy | 0-1 | any / faith+margin | Justice done fast and outdoors; the town remembers every name it has carried. |
| [ADD] | The claim diggings | 3 | site | vast | 1-3 | labor / labor+criminal | Staked ground, jealously watched; every hole is somebody's hope or somebody's theft. |
