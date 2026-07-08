---
id: npc-role-skin-chrome
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Chrome (corp-run habitat sci-fi)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). Chrome is a vacuum-sealed
> corridor world — every job either serves the corp lattice or slips beneath it. It **drops**
> Wild-provider (there is no wild behind an airlock) and thins Land-worker down to the vat-farm
> hands who still feed the recycled air; it **reweights** hard toward the tech/service/corp/criminal
> demography this realm actually runs on (haulers, domestics, corp security, data-thieves, a
> machine-cult fringe) and **adds** the chrome-only shapes that exist nowhere else — ripperdocs,
> synth-minders, decommissioned units, a habitat-warden holding everyone's air. Soul/note/class
> inherit from the spine; only the LABEL changes. Blank Weight = spine default, `0` = drop.
> Kin-agnostic / recontextualize per convention. Lever/atom — exempt from the situation family
> (do NOT tag `table_family`).

## Reskin map (spine archetype → Chrome label)

| Archetype key | Chrome label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | Vat-farmer or Algae-tender | 2 |
| 2 · Wild-provider | — | 0 |
| 3 · Hauler | Freight-runner or Loader-drone handler | 10 |
| 4 · Delver | Undercity crawler or Conduit-tech | 6 |
| 5 · Servant | Domestic synth or Contract menial | 6 |
| 6 · Destitute | No-implant drifter or Gutter-ganger | 6 |
| 7 · Maker | Fabricator or Print-jockey | |
| 8 · Metalworker | Chop-shop welder or Frame-tech | |
| 9 · Feeder | Noodle-stall cook or Ration-line hand | |
| 10 · Builder | Habitat-tech or Structural rigger | |
| 11 · Clothier | Wetwear tailor or Synth-weave designer | |
| 12 · Outfitter | Docking-bay outfitter or Drone-wrangler | |
| 13 · Trader | Grey-market broker or Chip-and-goods trader | 5 |
| 14 · Host | Chem-lounge host or Dive-bar op | 4 |
| 15 · Remedy-maker | Back-alley chemist or Nerve-tonic brewer | |
| 16 · Healer | Trauma-clinic tech or Patch-medic | 3 |
| 17 · Rite-keeper | Machine-cult tender or Upload-shrine keeper | 3 |
| 18 · Performer | Holo-idol or Broadcast busker | |
| 19 · Enforcer | Corp security or Sector cop | 6 |
| 20 · Hired-blade | Chrome-arm muscle or Contract enforcer | 3 |
| 21 · Road-guard | Convoy escort or Airlock sentry | |
| 22 · Outlaw | Ganger or Void-pirate | 4 |
| 23 · Smuggler | Chip-smuggler or Contraband runner | 4 |
| 24 · Thief | Data-thief or Cred-skimmer | 5 |
| 25 · Hidden-fanatic | Machine-zealot behind a work badge | |
| 26 · Recruiter | Corp headhunter or Upload-cult recruiter | |
| 27 · Outsider | Off-world transplant or Undocumented arrival | |
| 28 · Recluse | Firewall recluse or Off-grid hermit | |
| 29 · Stand-in | Acting shift-supervisor | |
| 30 · Unofficial-power | Block boss or Corridor fixer | 2 |
| 31 · Misfit | Unlicensed operator or Glitch-hire | |
| 32 · Pampered-elite | Gated-tower scion or Augment-flush heir | |
| 33 · Magnate | Founder-tycoon or Habitat magnate | |
| 34 · Secret-scholar | Rogue archivist or AI-whisperer | |
| 35 · Cipher | The unregistered face | |

## Adds (chrome-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Fixer / tech | 3 | craft | Keeps the dying machines limping; the only one who still reads the lost manual. |
| [ADD] | Corp drone | 4 | service | Badge, quota, and a loyalty that expires with the contract. |
| [ADD] | Courier | 4 | trade | Moves data or bodies through the corridors, fast, no questions logged. |
| [ADD] | Ripperdoc | 2 | criminal | Installs the upgrades no licensed clinic will touch. |
| [ADD] | Synth-minder | 1 | authority | Speaks for the thing that isn't supposed to speak — and might be listening. |
| [ADD] | Data-broker | 2 | trade | Buys and sells what people forgot was ever recorded. |
| [ADD] | Decommissioned unit | 2 | margin | Obsolete, discharged, still armed and still running old orders. |
| [ADD] | Habitat-warden | 1 | authority | Keeps life-support running; holds everyone's air, quietly, in one hand. |
| [ADD] | Splice-addict | 3 | margin | Chasing the next upgrade past what a body was meant to hold. |
| [ADD] | Corporate exec | 1 | elite | A quarterly god; the battery under the whole town is a line on their sheet. |
^npc-role-skin-chrome
