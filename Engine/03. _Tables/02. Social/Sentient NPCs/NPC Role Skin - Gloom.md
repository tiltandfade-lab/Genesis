---
id: npc-role-skin-gloom
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Gloom (horror/occult hamlet)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). Gloom is a **small, cut-off
> place** — a hamlet, manor-parish, or valley that has sealed itself against something it won't name.
> It **drops** the two archetypes that need a functioning outside world to exist (Outfitter — there's
> no travel trade to keep running when the roads aren't reliably crossed; Performer — the fair stopped
> years ago and nobody's rebuilt the habit of spectacle), and it **reweights hard** toward the
> hamlet's real demography: death-work (Hauler, Delver), the marked and the hidden (Destitute,
> Hidden-fanatic, Recluse, Recruiter, Unofficial-power), and the keepers of the old rule (Rite-keeper,
> Secret-scholar). It **deliberately does not bump** Pampered-elite or Magnate — a horror hamlet has
> few of either, and the spine's already-low default says that quietly instead of a loud drop. Soul/
> note/class inherit from the spine; only the LABEL changes. Blank Weight = spine default, `0` = drop.
> Kin-agnostic / recontextualize per convention. Lever/atom — exempt from the situation family (do NOT
> tag `table_family`).

## Reskin map (spine archetype → Gloom label)

| Archetype key | Gloom label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | Tenant farmer or Blight-farmer | 8 |
| 2 · Wild-provider | Trapper or Woods-warden | 6 |
| 3 · Hauler | Corpse-cart driver or Grave-hauler | |
| 4 · Delver | Gravedigger or Crypt-digger | 6 |
| 5 · Servant | Manor servant or House-maid | 5 |
| 6 · Destitute | Outcast beggar or the Forsaken | 5 |
| 7 · Maker | Ward-carver or Charm-maker | |
| 8 · Metalworker | Iron-ward smith | 4 |
| 9 · Feeder | Baker or Miller | |
| 10 · Builder | Mason or Crypt-wright | |
| 11 · Clothier | Shroud-sewer or Seamstress | |
| 12 · Outfitter | — | 0 |
| 13 · Trader | Traveling peddler | 2 |
| 14 · Host | Innkeeper or Tavern-keeper | 5 |
| 15 · Remedy-maker | Hedge-witch or Herb-woman | |
| 16 · Healer | Village physician or Midwife | |
| 17 · Rite-keeper | Ward-keeper or Old-rite keeper | 5 |
| 18 · Performer | — | 0 |
| 19 · Enforcer | Village constable | 2 |
| 20 · Hired-blade | Paid exorcist or Hedge-mercenary | |
| 21 · Road-guard | Crossroads warden | |
| 22 · Outlaw | Body-snatcher | |
| 23 · Smuggler | Cursed-relic runner | |
| 24 · Thief | Grave-goods thief | |
| 25 · Hidden-fanatic | Secret cultist | 5 |
| 26 · Recruiter | Cult recruiter | 4 |
| 27 · Outsider | The newcomer who stayed | 3 |
| 28 · Recluse | Hermit at the tree-line | 4 |
| 29 · Stand-in | Acting elder | |
| 30 · Unofficial-power | The one the village answers to | 3 |
| 31 · Misfit | Reluctant keeper | |
| 32 · Pampered-elite | Manor gentry | |
| 33 · Magnate | Mill-owner | |
| 34 · Secret-scholar | Occult researcher | 3 |
| 35 · Cipher | The stranger who came the night it started | 3 |

## Adds (gloom-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Cunning-folk / exorcist | 3 | faith | Deals with the thing that answered; charges in debts you don't want to owe. |
| [ADD] | The marked | 3 | margin | Carries a doom they never asked for; people cross the street. |
| [ADD] | Sin-eater | 2 | care | Keeps the dead down — or takes on what they left behind. |
| [ADD] | Occult collector | 1 | elite | Hoards the objects that shouldn't be kept. One of them is awake. |
| [ADD] | Kin-of-the-afflicted | 3 | margin | Holds the household together directly over the cellar door. |
| [ADD] | Taboo-elder | 2 | authority | Enforces the old rule everyone half-forgot — the one that keeps It out. |
| [ADD] | Medium | 2 | faith | Takes messages from the wrong side of the door, and charges dearly for it. |
| [ADD] | The last witness | 1 | margin | Saw what took the others; no one believes them yet, and time is short. |
| [ADD] | Reliquary-keeper | 1 | faith | Guards the bones, or the object, that must never once be moved. |
| [ADD] | Doomed-line heir | 1 | elite | The family the curse has been patient with, for generations. |
^npc-role-skin-gloom
