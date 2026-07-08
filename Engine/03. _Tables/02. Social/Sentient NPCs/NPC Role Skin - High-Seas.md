---
id: npc-role-skin-high-seas
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — High-Seas (age of sail: salt, debt-to-the-crew, a horizon that keeps its own counsel)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). High-Seas is a **ship-and-port
> world**, not a tilled one — it **drops Land-worker** (weight `0`): this realm's food comes off the
> sea and out of the hold, not out of soil, and fixed farmland is Frontier's territory, not this
> realm's. Everything else reskins, but the demography tilts hard maritime: it **reweights up** the
> roles a working ship or wharf actually runs on (fisherfolk, dockhands, carpenters, sailmakers,
> pursers, tavern-keepers, shantymen, masters-at-arms, and — this realm's signature figure — the
> pirate/mutineer), and **reweights down** the roles a ship rarely carries at all (smiths, chaplains,
> idle passengers, road-guards with no road to guard). Soul/note/class inherit from the spine; only
> the LABEL and weight change. Blank Weight = spine default, `0` = drop. Kin-agnostic / recontextualize
> per convention. Lever/atom — exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → High-Seas label)

| Archetype key | High-Seas label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | — | 0 |
| 2 · Wild-provider | Fisherman or Whaler | 10 |
| 3 · Hauler | Dockhand or Deckhand | 12 |
| 4 · Delver | Hold-rat or Ballast-shifter | |
| 5 · Servant | Captain's steward | |
| 6 · Destitute | Wharf-beggar or Dock-tramp | |
| 7 · Maker | Shipwright | |
| 8 · Metalworker | Ship's smith or Cannon-armorer | 1 |
| 9 · Feeder | Ship's cook or Galley-hand | |
| 10 · Builder | Ship's carpenter | 5 |
| 11 · Clothier | Sailmaker or Rigger | 5 |
| 12 · Outfitter | Ship's chandler | |
| 13 · Trader | Purser or Trade-factor | 5 |
| 14 · Host | Portside tavern-keeper | 4 |
| 15 · Remedy-maker | Herb-woman of the port | |
| 16 · Healer | Surgeon's mate or Loblolly boy | |
| 17 · Rite-keeper | Ship's chaplain | 1 |
| 18 · Performer | Shantyman | 3 |
| 19 · Enforcer | Master-at-arms | 5 |
| 20 · Hired-blade | Cutlass-for-hire | |
| 21 · Road-guard | Convoy-escort hand | 1 |
| 22 · Outlaw | Pirate or Mutineer | 6 |
| 23 · Smuggler | Smuggler or Blockade-runner | 4 |
| 24 · Thief | Ship's rat or Dockside cutpurse | |
| 25 · Hidden-fanatic | Devotee of the drowned god | |
| 26 · Recruiter | Press-gang recruiter | |
| 27 · Outsider | Foreign hand signed at the last port | |
| 28 · Recluse | The one who never comes above decks | |
| 29 · Stand-in | Acting mate (the officer lost or drowned) | |
| 30 · Unofficial-power | Fo'c'sle boss | |
| 31 · Misfit | Landsman who never should've shipped out | |
| 32 · Pampered-elite | Passenger of quality | 1 |
| 33 · Magnate | Trading-company nabob or Fleet-owner | |
| 34 · Secret-scholar | Chart-hoarder with a route no captain will buy | |
| 35 · Cipher | The stowaway no manifest explains | |

## Adds (high-seas-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Ship's captain | 2 | authority | Owes the crew as much as they're owed; the ledger is law aboard. |
| [ADD] | Navigator | 2 | craft | Holds the torn chart everyone needs — and the real route is only in their head. |
| [ADD] | Press-ganged hand | 3 | margin | Didn't choose the sea; the sea has them now anyway. |
| [ADD] | Privateer | 2 | criminal | A letter of marque, or none — depending on who's asking, and when. |
| [ADD] | Harbor-master | 1 | authority | Decides which cargo is seen; every manifest is negotiable. |
| [ADD] | Ship's surgeon | 2 | care | Saw, needle, and rum; the crew's whole hope below the waterline. |
| [ADD] | Bosun | 2 | authority | The captain's fist — keeps the crew, and the debt, in line. |
| [ADD] | Cabin-child | 2 | margin | Sees everything, counts for nothing, and remembers all of it. |
| [ADD] | Merchant-shipper | 2 | elite | Owns the cargo, never the risk; insures against their own crew. |
| [ADD] | Shipwreck-survivor | 1 | margin | Washed in from somewhere that sank; knows a way back no one wants. |
^npc-role-skin-high-seas
