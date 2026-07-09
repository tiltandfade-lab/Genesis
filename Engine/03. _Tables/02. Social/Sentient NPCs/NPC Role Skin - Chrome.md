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

# NPC Role Skin — Chrome (neon-slum megacity)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). **RE-KEYED 2026-07-08** from
> corp-run habitat sci-fi to a neon-slum megacity — subway trains, street gangs with theatrical
> identities, graffiti-as-territory, mutants in the storm drains, corporate super-cops, and
> enforcement mechs (The Warriors × Ninja Turtles × RoboCop, serial numbers filed off). Every job
> either serves the corp lattice above or slips beneath it into the tunnels and drains. It **drops**
> Wild-provider (there is no frontier wilderness in a walled megacity) and thins Land-worker to the
> rooftop-garden and hydroponics hands who still feed the towers; it **reweights** hard toward the
> tech/service/corp/gang/criminal demography this realm actually runs on (haulers, domestics, beat
> cops, corp muscle, data-thieves, a street-cult fringe) and **adds** the chrome-only shapes that
> exist nowhere else — ripperdocs, enforcement-mech handlers, decommissioned units, a transit warden
> holding the whole line's power. Soul/note/class inherit from the spine; only the LABEL changes.
> Blank Weight = spine default, `0` = drop. Kin-agnostic / recontextualize per convention.
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Chrome label)

| Archetype key | Chrome label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | Rooftop-garden hand or Hydroponics tender | 2 |
| 2 · Wild-provider | — | 0 |
| 3 · Hauler | Freight-runner or Subway-freight loader | 10 |
| 4 · Delver | Storm-drain crawler or Tunnel-rat | 6 |
| 5 · Servant | Building-super's menial or Contract janitor | 6 |
| 6 · Destitute | No-cred drifter or Gutter-ganger | 6 |
| 7 · Maker | Back-room fabricator or Print-jockey | |
| 8 · Metalworker | Chop-shop welder or Frame-tech | |
| 9 · Feeder | Noodle-cart cook or Soup-line hand | |
| 10 · Builder | Scaffold rigger or Tenement fixer | |
| 11 · Clothier | Colors-tailor or Street-wear stitcher | |
| 12 · Outfitter | Corner gearhead or Ride-wrangler | |
| 13 · Trader | Grey-market broker or Pawn-stall trader | 5 |
| 14 · Host | Dive-bar op or Backroom-club host | 4 |
| 15 · Remedy-maker | Back-alley chemist or Nerve-tonic brewer | |
| 16 · Healer | Sewer-clinic medic or Patch-medic | 3 |
| 17 · Rite-keeper | Street-shrine tender or Underground preacher | 3 |
| 18 · Performer | Corner MC or Pirate-broadcast busker | |
| 19 · Enforcer | Beat cop or Sector patrol | 6 |
| 20 · Hired-blade | Gang muscle or Contract enforcer | 3 |
| 21 · Road-guard | Convoy escort or Turnstile sentry | |
| 22 · Outlaw | Ganger or Tunnel-line pirate | 4 |
| 23 · Smuggler | Contraband runner or Tunnel-mule | 4 |
| 24 · Thief | Data-thief or Cred-skimmer | 5 |
| 25 · Hidden-fanatic | Street-cult zealot behind a day-job badge | |
| 26 · Recruiter | Corp headhunter or Gang recruiter | |
| 27 · Outsider | Out-of-town transplant or Undocumented arrival | |
| 28 · Recluse | Firewall recluse or Off-grid hermit | |
| 29 · Stand-in | Acting shift-supervisor | |
| 30 · Unofficial-power | Block boss or Corner fixer | 2 |
| 31 · Misfit | Unlicensed operator or Glitch-hire | |
| 32 · Pampered-elite | Arcology-tower scion or Trust-fund heir | |
| 33 · Magnate | Corp founder or Real-estate magnate | |
| 34 · Secret-scholar | Rogue archivist or Records-hacker | |
| 35 · Cipher | The unregistered face | |

## Adds (chrome-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Fixer / tech | 3 | craft | Keeps the dying machines limping from a sewer-workshop; the only one who still reads the lost manual. |
| [ADD] | Corp cop | 4 | service | Corporate badge, quota, and a loyalty that expires with the contract — a different animal from the beat cop on the block. |
| [ADD] | Courier | 4 | trade | Moves data or bodies through the tunnels, fast, no questions logged. |
| [ADD] | Ripperdoc | 2 | criminal | Installs the grafts no licensed clinic will touch, in a back room under a noodle stall. |
| [ADD] | Enforcement-mech handler | 1 | authority | Speaks for the walking gun that isn't supposed to speak — and it's listening. |
| [ADD] | Data-broker | 2 | trade | Buys and sells what people forgot was ever recorded. |
| [ADD] | Decommissioned unit | 2 | margin | Obsolete cop-frame, discharged, still armed and still running old patrol orders. |
| [ADD] | Transit warden | 1 | authority | Keeps the trains and the grid running; holds the whole line's power, quietly, in one hand. |
| [ADD] | Splice-addict | 3 | margin | Chasing the next graft past what a body was meant to hold. |
| [ADD] | Corner journalist | 2 | service | Films everything on a cheap rig; sells the footage to whoever's losing, uploads it before anyone can buy the silence. |
| [ADD] | Corporate exec | 1 | elite | A quarterly god; the power grid under the whole city is a line on their sheet. |
^npc-role-skin-chrome
