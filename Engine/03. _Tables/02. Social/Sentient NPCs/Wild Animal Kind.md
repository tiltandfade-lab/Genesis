---
id: wild-animal-kind
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
remembers: codex
---

#wild-animal-kind# Wild Animal Kind (d12)

> PARTIAL-NPC ATOM ([[NPC-PARTIALS]], [[ANIMAL-SOCIAL]] §1/§6 U1) — the wilderness-band sibling of
> [[animal-kind]], rolled by `rollPartial('animal', {env:'wilderness'})` (weighted-pool selection
> chooses this table over `animal-kind` for the wilderness band; the other four bands stay on the
> domestic spine, reweighted). Mirrors `animal-kind`'s shape exactly: a **kind** (this table), a
> **tell** ([[animal-tell]]), and a simple **need** (hungry · guarding · lost · loyal) — no
> want/lever stack, an animal is not a moral agent. Exempt from the situation family — do NOT tag
> `table_family: situation`. Row 11 is the realm-skin slot (per Adam's RESOLVED ruling 1,
> [[ANIMAL-SOCIAL]]: animal realm skins get the full spine/skin/extras treatment like roles —
> `data/animal-realm-skins.js` ANIMAL_REALM_SKINS carries the per-realm wild-face label, keyed off
> this row's `realm-skin` tag; the row text below is the un-skinned fallback). Row 12 is "the elder
> of the wood" — the wilderness analog of Animal Kind's row 12 town's-own-animal: a landmark, named
> creature every other animal on the node defers to (§5 territory-holder candidate). CRAFT-LANE:
> these rows are drafts for Adam's pass, per the spec.

| d12 | Kind | Tags |
| ---: | --- | --- |
| 1 | Territory wolf or pack-runner — holds a stretch of ground and knows every crossing of it. | pack, territory |
| 2 | Grazing herd — deer, elk, or wild goats; moves as a body, and reads the wind before the ranger does. | herd, instinct |
| 3 | Watcher-bird — hawk, owl, or crow; sees the whole valley from height and forgets nothing it circled. | bird, watcher |
| 4 | River or marsh dweller — otter, heron, or beaver; knows the water's moods better than any map. | water, instinct |
| 5 | Burrower — badger, fox, or ground-den thing; knows what the earth carries underneath. | burrow, solitary |
| 6 | Ambush predator — lynx, serpent, or stalking cat; solitary, patient, and the reason the trail went quiet. | predator, solitary |
| 7 | Carrion-feeder — vulture, jackal, or scavenger-pack; first to know when something has died nearby. | scavenger, pack |
| 8 | Migrant flock — geese, cranes, or a moving swarm; passes through and carries news of where it's been. | flock, transient |
| 9 | Old solitary beast — a bear, a boar, a stag past its prime; scarred, wary, and gives ground to no one. | solitary, sentinel |
| 10 | Half-wild fringe-dweller — a creature drawn to the edge of camps, curious and never quite trusting. | wild, wary |
| 11 | The realm-beast — [reskin slot] the wilderness face this realm wears (see `ANIMAL_REALM_SKINS`). | realm-skin |
| 12 | The elder of the wood — the beast every other animal on the node defers to; its territory IS the node. | landmark, bonded |
^wild-animal-kind
