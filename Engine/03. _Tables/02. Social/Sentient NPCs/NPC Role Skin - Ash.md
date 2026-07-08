---
id: npc-role-skin-ash
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Ash (post-collapse wasteland)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). Ash relabels the spine to
> the salvage-and-survive economy of a world that already ended once, **drops** the two archetypes
> whose whole soul depends on a stable, insulated wealth-class that didn't survive the collapse
> (Pampered-elite, Magnate — old money doesn't outlive the end of the world; the "elite" of Ash is
> reinvented entirely as the resource-hoarders in the Adds below, and none of them are insulated
> from real consequence), and **reweights** hard toward the roles that matter when infrastructure
> is gone and the threat is constant: haulers, ruin-delvers, waste-hunters, raiders, and the
> warlord's own enforcers. Soul/note/class inherit from the spine; only the LABEL changes. Blank
> Weight = spine default, `0` = drop. Kin-agnostic / recontextualize per convention. Lever/atom —
> exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Ash label)

| Archetype key | Ash label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | Dirt-farmer (scorched rows, hydroponic scraps) | 3 |
| 2 · Wild-provider | Waste-hunter | 10 |
| 3 · Hauler | Convoy hand | 12 |
| 4 · Delver | Ruin-diver or Vault-delver | 8 |
| 5 · Servant | Bonded hand (indentured to a warlord or hoarder) | |
| 6 · Destitute | The Starving | 6 |
| 7 · Maker | Salvage-tinker | 6 |
| 8 · Metalworker | Scrap-smith | |
| 9 · Feeder | Ration-cook | |
| 10 · Builder | Wall-raiser | 4 |
| 11 · Clothier | Rag-mender | |
| 12 · Outfitter | Rig-mechanic | 5 |
| 13 · Trader | Barter-runner | 5 |
| 14 · Host | Waystation-keeper | |
| 15 · Remedy-maker | Herb-scrounger | |
| 16 · Healer | Settlement medic | 3 |
| 17 · Rite-keeper | Keeper of the old rites | |
| 18 · Performer | Waste-bard | |
| 19 · Enforcer | Warlord's enforcer | 6 |
| 20 · Hired-blade | Gun-for-hire | 4 |
| 21 · Road-guard | Convoy escort | 4 |
| 22 · Outlaw | Raider | 6 |
| 23 · Smuggler | Black-market runner | 4 |
| 24 · Thief | Camp-rat | |
| 25 · Hidden-fanatic | Believer in plain clothes | |
| 26 · Recruiter | Warlord's press-gang boss | 3 |
| 27 · Outsider | Wastelander from beyond the map | |
| 28 · Recluse | Bunker hermit | 2 |
| 29 · Stand-in | Acting boss (the old one didn't come back) | |
| 30 · Unofficial-power | Settlement fixer | 2 |
| 31 · Misfit | Conscript who never should've held the rifle | |
| 32 · Pampered-elite | — | 0 |
| 33 · Magnate | — | 0 |
| 34 · Secret-scholar | Archive-keeper | 2 |
| 35 · Cipher | The one who remembers before | |

## Adds (ash-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Scavenger | 4 | wild | Reads a dead town for the one thing left in it that still works. |
| [ADD] | Warlord | 2 | authority | Owns the water, the fuel, or the guns — and that's the whole law now. |
| [ADD] | Vault-hoarder | 1 | elite | Sits on a stockpile everyone else has decided is theirs by right. |
| [ADD] | Waste-healer | 2 | care | Trades clean water for wounds; knows which sickness is the new kind. |
| [ADD] | Cult-of-the-before | 2 | faith | Worships the world that ended; keeps a dead machine as its shrine. |
| [ADD] | Water-baron | 1 | elite | Holds the one clean source, and rations it out like a small god. |
| [ADD] | Radio-voice | 1 | service | Broadcasts into the waste; the only thing every survivor still shares. |
| [ADD] | Marked-by-the-end | 2 | margin | Changed by what happened — feared, and quietly indispensable. |
| [ADD] | Convoy-runner | 3 | trade | Moves goods between dead towns, armored, paranoid, and usually right to be. |
| [ADD] | Reclaimer | 2 | faith | Trying to restart one dead thing — a pump, a field, a school — against all sense. |
^npc-role-skin-ash
