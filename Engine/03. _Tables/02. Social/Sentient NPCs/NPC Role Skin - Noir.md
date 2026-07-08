---
id: npc-role-skin-noir
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Noir (rain-slicked modern crime)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). This is a **pattern-proof
> skin**: it relabels the spine to city-crime jobs, **drops** the archetypes a rain-city can't hold
> (no wilds, no wagon-shops), **reweights** toward crime/law/trade, and **adds** the noir-only shapes.
> Soul/note/class inherit from the spine; blank Weight = spine default, `0` = drop. Kin-agnostic /
> recontextualize per convention. Lever/atom — exempt from the situation family (do NOT tag
> `table_family`).

## Reskin map (spine archetype → noir label)

| Archetype key | Noir label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | — | 0 |
| 2 · Wild-provider | — | 0 |
| 3 · Hauler | Longshoreman or Teamster | 10 |
| 4 · Delver | Sandhog or Sewer-man | |
| 5 · Servant | Hotel bellhop or Charwoman | |
| 6 · Destitute | Vagrant or Flophouse tenant | |
| 7 · Maker | Machinist or Repairman | |
| 8 · Metalworker | Gunsmith or Locksmith | |
| 9 · Feeder | Diner cook or Lunch-counter man | |
| 10 · Builder | Construction hand or Building super | |
| 11 · Clothier | Tailor or Seamstress | |
| 12 · Outfitter | — | 0 |
| 13 · Trader | Pawnbroker or Wholesaler | 5 |
| 14 · Host | Barkeep or Club owner | 5 |
| 15 · Remedy-maker | Chemist or Pharmacist | |
| 16 · Healer | Back-alley doctor or Nurse | |
| 17 · Rite-keeper | Parish priest | |
| 18 · Performer | Nightclub act or Emcee | |
| 19 · Enforcer | Beat cop or Precinct detective | 6 |
| 20 · Hired-blade | Triggerman or Leg-breaker | 3 |
| 21 · Road-guard | Bodyguard or Wheelman | |
| 22 · Outlaw | Stick-up man or Heist crew | 4 |
| 23 · Smuggler | Bootlegger or Runner | 4 |
| 24 · Thief | Second-story man or Grifter | 4 |
| 25 · Hidden-fanatic | True-believer behind a clerk's face | |
| 26 · Recruiter | Union organizer or Outfit recruiter | |
| 27 · Outsider | Immigrant newcomer or Out-of-towner | |
| 28 · Recluse | Shut-in | |
| 29 · Stand-in | Acting captain or Understudy | |
| 30 · Unofficial-power | Ward boss or Neighborhood fixer | 2 |
| 31 · Misfit | In-over-their-head appointee | |
| 32 · Pampered-elite | Society heir or Kept socialite | |
| 33 · Magnate | Shipping or real-estate magnate | |
| 34 · Secret-scholar | Occult collector or Alienist | |
| 35 · Cipher | The stranger in the good suit | |

## Adds (noir-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Private eye | 3 | margin | Takes the case nobody else will, for money they'll probably never see. |
| [ADD] | Fatale | 2 | criminal | The reason the case exists; wants the one thing you can't hand over. |
| [ADD] | Crooked D.A. / captain | 1 | authority | The law, for sale, with a smile and a firm handshake. |
| [ADD] | Stool-pigeon | 2 | criminal | Sells whispers; terrified of the morning the buyer decides they're done. |
| [ADD] | Torch singer | 2 | service | The club fixture who sees exactly who meets whom after midnight. |
| [ADD] | Honest beat cop | 2 | authority | The one clean badge on the force, and it's killing their career. |
| [ADD] | Mob accountant | 1 | criminal | Makes the problems and the receipts disappear, in that order. |
| [ADD] | Widow with a policy | 2 | margin | Grieving, insured, and lying about exactly one thing. |
| [ADD] | Newshound | 2 | trade | Chases the story past the point where it's safe to print. |
| [ADD] | Numbers-runner | 3 | criminal | The block's small-time bank, and owes upward every single week. |
^npc-role-skin-noir
