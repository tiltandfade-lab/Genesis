---
type: audit-report
project: Genesis
status: REPORT-ONLY — no code/table changes
created: 2026-07-04
scope: "creature model coverage — data/bestiary.js (510) vs src/ui/theater-figures.js registry"
---

# Creature model coverage audit

**Today:** 510/510 monsters (100%) resolve to a bespoke whole-object model
(117 direct registry keys + 393 nearest-sub aliases). The other
0 render as the **cuboid fallback** in combat.

**If we accept the alias proposals below:** 510/510 (100%) covered by aliasing to
existing models — **0 monsters need NO new geometry**, just nearest-sub lines. That leaves
**0 that genuinely need a net-new model** (0% of the bestiary), listed by type at the end.

> Heuristic proposals — every ALIAS is a silhouette-family guess (type + size + name). Adam gates
> each at taste review; a wrong family is a one-line edit. The NEW list is where the real modeling
> effort goes.

## Coverage math

| bucket | count | % of 510 |
|---|---:|---:|
| covered today (registry + aliases) | 510 | 100% |
| + proposed aliases (no new geometry) | 0 | 0% |
| **projected total covered** | **510** | **100%** |
| **still need a net-new model** | **0** | **0%** |

## Proposed NEAREST_SUB additions (grouped by target model)

Paste-ready. 0 aliases across 0 existing models.

```js
```

## Net-new model build list (0) — ranked by type

These have no honest existing silhouette. Grouped by creature type (a type often shares a buildable
base — e.g. one good "many-legged monstrosity" base could seed several).

