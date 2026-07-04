---
type: audit-report
project: Genesis
status: REPORT-ONLY — no code/table changes
created: 2026-07-04
scope: "creature model coverage — data/bestiary.js (510) vs src/ui/theater-figures.js registry"
---

# Creature model coverage audit

**Today:** 444/510 monsters (87%) resolve to a bespoke whole-object model
(51 direct registry keys + 393 nearest-sub aliases). The other
66 render as the **cuboid fallback** in combat.

**If we accept the alias proposals below:** 444/510 (87%) covered by aliasing to
existing models — **0 monsters need NO new geometry**, just nearest-sub lines. That leaves
**66 that genuinely need a net-new model** (13% of the bestiary), listed by type at the end.

> Heuristic proposals — every ALIAS is a silhouette-family guess (type + size + name). Adam gates
> each at taste review; a wrong family is a one-line edit. The NEW list is where the real modeling
> effort goes.

## Coverage math

| bucket | count | % of 510 |
|---|---:|---:|
| covered today (registry + aliases) | 444 | 87% |
| + proposed aliases (no new geometry) | 0 | 0% |
| **projected total covered** | **444** | **87%** |
| **still need a net-new model** | **66** | **13%** |

## Proposed NEAREST_SUB additions (grouped by target model)

Paste-ready. 0 aliases across 0 existing models.

```js
```

## Net-new model build list (66) — ranked by type

These have no honest existing silhouette. Grouped by creature type (a type often shares a buildable
base — e.g. one good "many-legged monstrosity" base could seed several).

### Aberration (22)
- astral-raider-dracomancer
- blue-chaos-frog
- cloaker
- death-chaos-frog
- elder-deep-thing
- eye-tyrant
- fish-folk
- fish-folk-monitor
- fish-folk-whip
- gray-chaos-frog
- green-chaos-frog
- grell
- grick
- grick-ancient
- mind-thief
- mind-thief-arcanist
- otyugh
- red-chaos-frog
- roper
- void-monk-monk
- void-monk-psion
- void-monk-zerth

### Monstrosity (21)
- abominable-yeti
- ankheg
- axe-beak
- behir
- bulette
- carrion-crawler
- chimera
- displacer-beast
- drider
- giant-axe-beak
- hook-horror
- hydra
- kraken
- manticore
- merrow
- purple-worm
- remorhaz
- tarrasque
- umber-hulk
- yeti
- yuan-ti-abomination

### Fiend (14)
- arcanaloth
- barbed-devil
- cambion
- chain-devil
- erinyes
- incubus
- lemure
- manes-vaporspawn
- mezzoloth
- night-hag
- rakshasa
- succubus
- ultroloth
- yochlol

### Celestial (9)
- deva
- empyrean
- empyrean-iota
- planetar
- solar
- sphinx-of-lore
- sphinx-of-secrets
- sphinx-of-valor
- unicorn

