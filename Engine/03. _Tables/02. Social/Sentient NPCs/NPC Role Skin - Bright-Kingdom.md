---
id: npc-role-skin-bright-kingdom
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

# NPC Role Skin — Bright-Kingdom (toybox anachronism, teeth under the candy)

> Realm skin over [[npc-role-spine]] ([[NPC-ROLE-REALMS]] approach C). Bright-Kingdom runs on
> **game-logic, not agriculture or metallurgy** — power is eaten from a mushroom or a heart-shaped
> vial, not grown or forged — so it **drops** the two archetypes that presuppose a real economy of
> land and ore (Land-worker, Metalworker), **reweights** hard toward the toybox's actual demography
> (haulers pushing blocks, chefs stirring candy, cultists of the High Score, spoiled royalty, and the
> gambler who just ran out of lives), and **adds** the roles that exist only inside the rules of a
> game a child could recite. Every relabel keeps the same cheerful surface with the same hairline
> crack in it: the crown is real, the fine print is real, and the referee's rulings have consequences
> a child shouldn't watch. Soul/note/class inherit from the spine; only the LABEL changes. Blank
> Weight = spine default, `0` = drop. Kin-agnostic / recontextualize per convention. Lever/atom —
> exempt from the situation family (do NOT tag `table_family`).

## Reskin map (spine archetype → Bright-Kingdom label)

| Archetype key | Bright-Kingdom label | Weight |
| ---: | --- | ---: |
| 1 · Land-worker | — | 0 |
| 2 · Wild-provider | Overworld forager or Warp-zone scout | 10 |
| 3 · Hauler | Block-pusher or Cart-hauler | 12 |
| 4 · Delver | Pipe-diver or Underworld tunneler | |
| 5 · Servant | Wind-up page or Court page | |
| 6 · Destitute | Out-of-lives drifter or Bankrupt gambler | 6 |
| 7 · Maker | Toymaker | 8 |
| 8 · Metalworker | — | 0 |
| 9 · Feeder | Candy-chef or Sweet-shop baker | 6 |
| 10 · Builder | Block-mason | |
| 11 · Clothier | Mascot-suit tailor | |
| 12 · Outfitter | Kart-wright or Ride-mechanic | |
| 13 · Trader | Prize-broker or Ticket-changer | |
| 14 · Host | Save-point keeper or Rest-stop host | |
| 15 · Remedy-maker | Heart-container brewer | |
| 16 · Healer | Extra-life nurse | |
| 17 · Rite-keeper | Checkpoint priest | |
| 18 · Performer | Sideshow act or Circus barker | 3 |
| 19 · Enforcer | Wind-up soldier or Rule-goon | |
| 20 · Hired-blade | Rented mini-boss | |
| 21 · Road-guard | Gate-guard between worlds | |
| 22 · Outlaw | Glitch-goblin or Rule-breaker | 4 |
| 23 · Smuggler | Contraband power-up dealer | |
| 24 · Thief | Coin-snatcher or Item-nabber | |
| 25 · Hidden-fanatic | True-believer in the High Score | 4 |
| 26 · Recruiter | Talent-scout for the Game | |
| 27 · Outsider | Glitched-in wanderer | 3 |
| 28 · Recluse | Superboss no one's beaten | |
| 29 · Stand-in | Understudy mascot | |
| 30 · Unofficial-power | Backroom high-scorer | |
| 31 · Misfit | Miscast sprite | 2 |
| 32 · Pampered-elite | Spoiled prince or princess | 4 |
| 33 · Magnate | Arcade tycoon or Toy magnate | |
| 34 · Secret-scholar | Manual-keeper or Lore-hoarder | |
| 35 · Cipher | The NPC with no dialogue tree | 2 |

## Adds (bright-kingdom-only roles — layer over the reskin)

| Add | Role | Weight | Class | Note |
| --- | --- | ---: | --- | --- |
| [ADD] | Champion-by-the-rules | 1 | elite | Won the game everyone plays; the crown is literal, and heavier than it looks. |
| [ADD] | Prize-keeper | 2 | authority | Guards the reward that's watching you back; the rules protect it, not you. |
| [ADD] | Perpetual challenger | 3 | margin | Respawns to try again — cheerfully, endlessly, and a little wrong. |
| [ADD] | Power-up peddler | 3 | trade | Sells the thing you eat to get strong. The fine print has teeth. |
| [ADD] | Referee | 2 | authority | Enforces rules a child could recite, with consequences a child shouldn't see. |
| [ADD] | Mascot / herald | 3 | service | The too-cheerful face that greets you; the smile never once drops. |
| [ADD] | Collectible-hoarder | 2 | margin | Needs all of the set — and the last piece is guarded by something. |
| [ADD] | Level-boss | 1 | authority | Sits at the top of the map, bound by the rules to wait for a challenger. |
| [ADD] | Fairy-godmother figure | 1 | faith | Grants the boon; the fine print is a fairy-tale kind of cruel. |
| [ADD] | Reset-warden | 2 | margin | Puts everything back the way it was each morning, and hates when you notice. |
^npc-role-skin-bright-kingdom
