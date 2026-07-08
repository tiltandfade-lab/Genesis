---
id: npc-role-spine
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Spine — universal archetypes (realm-skinned)

> The **universal backbone** of the realm-skin role system ([[NPC-ROLE-REALMS]]). Each row is a
> role-ARCHETYPE and its **universal play-angle** (the soul — true in any realm); the job LABEL is
> supplied per-world by a realm skin, which may relabel, **drop** (archetype can't exist there), or
> **add** realm-unique roles. Engine does a **weighted pick** by `Weight`, then skins the label.
> Not a flat face-roll — the `#` is a stable key, `Weight` drives the pick. The current `npc-role`
> (frontier-coast) stays live and doubles as the de-facto Frontier skin until the engine switch.
> Lever/atom — exempt from the situation family (do NOT tag `table_family`).


| # | Archetype | Play-Angle (universal) | Weight | Tags |
| ---: | --- | --- | ---: | --- |
| 1 | Land-worker | Tied to the land and its seasons; the base everyone eats from. | 6 | labor |
| 2 | Wild-provider | Reads the wild and brings in what the settled can't. | 8 | wild |
| 3 | Hauler | Moves the heavy things; sees everything, is asked nothing. | 10 | labor |
| 4 | Delver | Works the dark and the tight places; patient underground. | 4 | labor |
| 5 | Servant | Invisible to the powerful, and so hears every secret. | 4 | service |
| 6 | Destitute | Has nothing, so knows the streets better than anyone. | 3 | margin |
| 7 | Maker | Their tools carry their whole history. | 5 | craft |
| 8 | Metalworker | Calloused hands; deals in practical defense. | 3 | craft |
| 9 | Feeder | Up before dawn; holds the neighborhood's gossip. | 3 | craft |
| 10 | Builder | Reads every structure out of habit; knows what's load-bearing. | 3 | craft |
| 11 | Clothier | Notices the cut and quality of everyone's clothes. | 3 | craft |
| 12 | Outfitter | Keeps the means of travel and trade running; eyes on the weather. | 3 | craft |
| 13 | Trader | Information-rich, truth-poor. | 4 | trade |
| 14 | Host | Controls the space, not the people in it. | 3 | trade |
| 15 | Remedy-maker | Smells of bitterroot; knows what heals and what doesn't. | 3 | care |
| 16 | Healer | Trusted, and overburdened by it. | 2 | care |
| 17 | Rite-keeper | Maintains the ritual, not the doctrine. | 2 | faith |
| 18 | Performer | Craves the attention; hides the true feeling under it. | 1 | service |
| 19 | Enforcer | Authority-adjacent, with limited real power. | 4 | authority |
| 20 | Hired-blade | Loyalty bought with coin, and cynical about it. | 2 | criminal |
| 21 | Road-guard | Wary of the road; values a good pair of boots. | 2 | authority |
| 22 | Outlaw | Desperate or cruel; lives outside the law. | 3 | criminal |
| 23 | Smuggler | Hides the cargo; speaks only in euphemism. | 2 | criminal |
| 24 | Thief | Eyes every coin-pouch; avoids every eye. | 2 | criminal |
| 25 | Hidden-fanatic | Fanatical devotion behind a mundane face. | 2 | faith |
| 26 | Recruiter | Charisma aimed at the desperate; sells belonging. | 2 | faith |
| 27 | Outsider | Chose to stay here; the reasons stay unclear. | 2 | margin |
| 28 | Recluse | Known of, rarely seen. | 1 | margin |
| 29 | Stand-in | Filling in for someone absent; borrowed authority. | 1 | authority |
| 30 | Unofficial-power | Power without a title. | 1 | authority |
| 31 | Misfit | Unqualified, unwilling, or both — and in the role anyway. | 1 | margin |
| 32 | Pampered-elite | Wealthy, bored, insulated from real consequence. | 2 | elite |
| 33 | Magnate | Sees every interaction as a transaction. | 1 | elite |
| 34 | Secret-scholar | Hoards the secret knowledge; sees others as material. | 1 | faith |
| 35 | Cipher | Their very presence is the notable thing. | 1 | margin |
^npc-role-spine
