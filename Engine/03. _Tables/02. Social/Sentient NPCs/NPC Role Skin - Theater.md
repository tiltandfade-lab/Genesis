---
id: npc-role-skin-theater
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Theater (of WAR, not stage)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). **"Theater" = theater of war**
> — NOT Broadway, and a *different* Theater from the battle-render stage (`BATTLE-THEATER` /
> `Theater.refFigure`). Almost every spine archetype has a **wartime form** (bearer, armorer, sapper,
> chaplain), so this skin reskins broadly rather than dropping; it **reweights** toward the war's real
> demography (bearers, refugees, soldiers, medics) and **adds** the shapes that exist only around a
> war. Presented through the world's current **era-lens** (trench · siege · legion · longship · jungle
> — the DM picks). **Content-safety (binding, per `Realm Items - Theater.md`):** no named nations or
> conflicts; real atrocity is never a role's flavor. Soul/note/class inherit from the spine; blank
> Weight = spine default, `0` = drop. Lever/atom — exempt from the situation family (do NOT tag
> `table_family`).

## Reskin map (spine archetype → wartime form)

| Archetype key | Theater (of War) label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | Requisitioned farmer or Forager | 2 |
| 2 · Wild-provider | Scout or Skirmisher | |
| 3 · Hauler | Ammunition-bearer or Baggage-train hand | 10 |
| 4 · Delver | Sapper or Trench-digger | |
| 5 · Servant | Officer's orderly / batman | 4 |
| 6 · Destitute | Refugee or Straggler | 6 |
| 7 · Maker | Field-artificer or Smith's mate | |
| 8 · Metalworker | Armorer | |
| 9 · Feeder | Cook or Mess-hand | |
| 10 · Builder | Field engineer or Bridge-layer | |
| 11 · Clothier | Kit-mender or Tent-wright | |
| 12 · Outfitter | Farrier or Wainwright of the train | |
| 13 · Trader | Sutler (camp merchant) | |
| 14 · Host | Canteen-keeper or Billet-master | |
| 15 · Remedy-maker | Camp bonesetter or Herb-woman | |
| 16 · Healer | Surgeon (the rear hospital) | |
| 17 · Rite-keeper | Chaplain | |
| 18 · Performer | Camp entertainer | |
| 19 · Enforcer | Provost-sergeant or Military police | 6 |
| 20 · Hired-blade | Mercenary or Free-company soldier | 5 |
| 21 · Road-guard | Picket or Sentry | |
| 22 · Outlaw | Marauder or Deserter-turned-brigand | |
| 23 · Smuggler | Contraband-runner or Blockade-runner | |
| 24 · Thief | Looter or Camp-thief | |
| 25 · Hidden-fanatic | Zealot-soldier or Fifth-columnist | |
| 26 · Recruiter | Press-gang or Recruiting sergeant | |
| 27 · Outsider | Foreign auxiliary from afar | |
| 28 · Recluse | Shell-shocked hermit behind the lines | |
| 29 · Stand-in | Field-promoted corporal (borrowed command) | |
| 30 · Unofficial-power | Trench boss or Camp strongman | |
| 31 · Misfit | Conscript who should never have been called | |
| 32 · Pampered-elite | Well-connected staff cornet | 1 |
| 33 · Magnate | War contractor | |
| 34 · Secret-scholar | Cryptographer or War-alchemist | |
| 35 · Cipher | The one no uniform explains | |

## Adds (war-only roles — no peacetime equivalent)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Officer | 3 | authority | Orders the line held; loved or hated, and rarely wrong about both. |
| [ADD] | Field-medic | 3 | care | Patches what the line breaks; ran out of the good supplies weeks ago. |
| [ADD] | Quartermaster | 2 | trade | Controls what everyone needs, and skims what nobody counts. |
| [ADD] | Runner | 2 | service | Carries the message under fire; knows what the officers won't say aloud. |
| [ADD] | Deserter | 2 | margin | Walked away from the line; now every uniform is a threat. |
| [ADD] | War-orphan / camp-follower | 4 | margin | The war's dependents; survive in its margins, move when it moves. |
| [ADD] | The captured | 1 | margin | Belongs to no side now — and is leverage to every side. |
| [ADD] | Veteran, missing a piece | 2 | margin | Came home from a war no one names, and it followed them back. |
^npc-role-skin-theater
