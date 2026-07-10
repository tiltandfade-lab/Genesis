---
id: place-spine
type: table
domain: Realms / Place Generation
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# Place Spine — universal site archetypes (realm-skinned)

> The **universal backbone** of the realm-skin place system ([[PLACE-GEN]] §2, mirror of
> [[npc-role-spine]]). Each row is a place-ARCHETYPE and its **universal function-note** (the
> play-angle of the SPACE — true in any realm); the LABEL is supplied per-world by a realm skin
> (relabel / **drop** / **add** / reweight). Engine does a **weighted pick** by `Weight`, then
> skins the label. `#` is a stable key. All rows are scale **site** (one scene's worth of space);
> settlements stay compositional (PLACE-GEN §2c).
> **GRID LAW fields:** `Space` is the footprint band — cramped / roomy / vast — which the engine
> maps to real 5-ft-cell dims (PLACE-GEN ADDENDUM §A/§B; band→cells mapping lives in
> data/place-skins.js, sourced from the Bastion gather). `Staff` = anchor+ambient headcount band.
> `Cast` = castProfile: `anchor-class / ambient-class+ambient-class` — classes are the NPC spine's
> `Tags` vocabulary (labor wild service margin craft trade care faith authority criminal elite),
> plus `any` = unfiltered pick. Rows PROVISIONAL 2026-07-09 (Fable draft, adopted-as-drafted per
> Adam's 2026-07-08 ruling; his craft pass owns final rows).
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).

| # | Archetype | Function-note (universal) | Weight | Scale | Space | Staff | Cast |
| ---: | --- | --- | ---: | --- | --- | --- | --- |
| 1 | Gathering-place | Where everyone passes through; the social switchboard; rumor's home. | 6 | site | roomy | 1-3 | trade / service+margin |
| 2 | Watering-hole | Drink, food, and talk after dark; every side of every feud at adjacent tables. | 8 | site | roomy | 2-4 | trade / service+margin |
| 3 | Market | Goods change hands and so does information; haggling is the local theater. | 7 | site | vast | 3-6 | trade / trade+margin |
| 4 | Seat-of-power | Where the decisions get made; petitioners wait; guards watch. | 4 | site | roomy | 2-4 | authority / authority+service |
| 5 | Hall-of-law | Judgment, records, and the cells under it. | 3 | site | roomy | 2-3 | authority / authority+criminal |
| 6 | Shrine | The realm's relationship with the numinous, in one room. | 5 | site | roomy | 1-2 | faith / faith+care |
| 7 | House-of-healing | Where the hurt go; the healer knows everyone's wounds and secrets. | 4 | site | roomy | 1-3 | care / care+service |
| 8 | Workplace | The town's labor, concentrated; skilled hands and workplace grudges. | 5 | site | vast | 3-6 | labor / labor+craft |
| 9 | Workshop | One craftsperson's domain; commissions, repairs, and pride. | 6 | site | cramped | 1-2 | craft / craft |
| 10 | Storehouse | Value at rest; guarded, inventoried, and worth robbing. | 4 | site | roomy | 1-2 | trade / labor+authority |
| 11 | Lodging | Beds for strangers; the ledger of who passed through. | 6 | site | roomy | 1-3 | trade / service+margin |
| 12 | Dwelling | Someone's home; entering means something. | 6 | site | cramped | 1-2 | any / margin+service |
| 13 | Threshold | The gate/door/checkpoint between here and elsewhere; someone controls it. | 5 | site | cramped | 1-2 | authority / authority+margin |
| 14 | Crossing | Where routes meet; travelers, tolls, and ambush geometry. | 4 | site | vast | 1-2 | trade / margin+criminal |
| 15 | Hideout | Where the unwelcome gather out of sight. | 4 | site | cramped | 2-4 | criminal / criminal+margin |
| 16 | Vice-den | Pleasure the daylight economy pretends not to see. | 3 | site | roomy | 2-4 | criminal / criminal+elite |
| 17 | Ruin | What this place used to be; the past, enterable. | 5 | site | roomy | 0-2 | margin / margin+wild |
| 18 | Boneyard | Where the dead are kept, and how the realm feels about them. | 3 | site | vast | 0-1 | faith / margin |
| 19 | Watch-post | Eyes on the horizon; first to know, first to die. | 3 | site | cramped | 1-2 | authority / authority |
| 20 | Wild-margin | The edge where the settled gives out; foraging, dumping, disappearing. | 4 | site | vast | 0-1 | wild / wild+margin |
| 21 | Works | The big shared machine — mill, dock, pump, reactor: what the place runs on. | 4 | site | vast | 2-4 | labor / labor+craft |
| 22 | Commons | Open shared ground — square, green, lot — where public things happen. | 5 | site | vast | 0-3 | any / margin+service |
| 23 | Seat-of-learning | Records, teaching, maps; who's allowed to know things. | 3 | site | roomy | 1-2 | faith / faith+service |
| 24 | Monument | The thing built to be remembered; what it commemorates is contested. | 2 | site | roomy | 0-1 | any / faith+margin |
