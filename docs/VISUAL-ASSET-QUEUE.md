---
type: reference
project: Genesis
status: the model-build backlog surfaced by the 2026-07-08 visual review+debug pass
created: 2026-07-08
related:
  - "[[TABLETOP-VISION]]"
  - "[[MODEL-GRAMMAR]]"
  - "[[DESIGN-GUIDE]]"        # §II.0b — all art is placeholder; enters via swap-cheap manifest seams
source: dev/model-qa audit (bestiary + realm) + tray-noun wiring audit, reconciled with Codex's diagnosis
---

# VISUAL-ASSET-QUEUE — what still needs a bespoke model

The 2026-07-08 review found the render pipeline is **fully covered** (0 creatures resolve to a
blank/missing model — every foe has a bespoke model or a NEAREST_SUB stand-in). So this is a
**fidelity backlog, not a holes backlog**: the work is upgrading stand-ins to bespoke, not filling
blanks. Everything here enters through the existing `WHOLE_OBJECT_REGISTRY` / `NEAREST_SUB` seams
(theater-figures.js) — add a module + registry entry, or re-point a `NEAREST_SUB` alias.

Coverage today: core bestiary 510 → 117 exact / 393 alias; realm 1307 (with `model`) → 734 exact /
573 alias. The entire 966-creature aliasing population funnels into just **42 registry targets**.

## Creatures — the 42 alias targets (build top-down; top 15 upgrade ~650 of ~966 foes)

Ranked by how many live creatures share each target (the real build-impact):

| build | target | inst | build | target | inst |
|---|---|---|---|---|---|
| 1 | **warrior-veteran** | 79 | 16 | earth-elemental | 27 |
| 2 | **skeleton** | 55 | 17 | gray-ooze | 26 |
| 3 | **giant-rat** | 54 | 18 | needle-blight | 26 |
| 4 | **giant-lizard** | 52 | 19 | wyvern | 22 |
| 5 | **wight** | 50 | 20 | giant-bat | 21 |
| 6 | **cultist** | 47 | 21 | ghoul | 21 |
| 7 | **young-red-dragon** | 46 | 22 | warhorse | 18 |
| 8 | **shadow** | 42 | 23 | giant-constrictor-snake | 18 |
| 9 | **harpy** | 40 | 24 | animated-armor | 17 |
| 10 | **bandit** | 36 | 25 | hill-giant | 15 |
| 11 | **ice-mephit** | 34 | 26 | mimic | 12 |
| 12 | **wolf** | 33 | 27 | giant-spider | 11 |
| 13 | **stone-golem** | 33 | 28 | guard | 10 |
| 14 | **ogre** | 32 | 29 | zombie | 9 |
| 15 | **owlbear** | 31 | 30 | orc-warrior | 8 |

Tail (31–42): cultist-fanatic 7, bugbear-warrior 6, fire-elemental 6, goblin-warrior 4,
gnoll-warrior 3, hobgoblin-soldier 3, worg 2, commoner 2, kobold 2, troll 2.

**`young-red-dragon` is the single highest-leverage build** — it's the stand-in for *every* chromatic
and metallic dragon line (43 distinct render keys, wyrmling→ancient). One good dragon body upgrades
the entire dragon roster.

**Stand-in-heaviest realms** (feel least bespoke until the top targets land):
gloom 66% · high-seas 62% · frontier 56% · bright-kingdom 56% · cosmic 54%.
Best-covered: ash 17% · lost-world 18%.

## Props — 14 missing keyword models (currently the unpainted `blank:prop` block)

Tray keyword rules emit these `part` families, but no `prop:*` registry entry exists, so they stage
as the plain block. Frequency = how many realm props also lean on them:

| prop model needed | freq | prop model needed | freq |
|---|---|---|---|
| **rubble-scatter** | 33 | mushroom-cluster | — |
| **basin-block** | 13 | ladder-rungs | — |
| **coffin-slab** | 12 | furnace-block | — |
| **chain-drape** | 10 | tent-canopy | — |
| **cage-frame** | 10 | bell-mass | — |
| **gear-cluster** | 9 | banner-pole | — |
| vine-tangle | — | tree-bare | — |

(12 base prop models already exist and are reachable: statue-figure, pillar-intact/broken, table-slab,
throne-seat, arch-frame, web-mass, well-shaft, crate, cart, shrine-block, candelabra.)

## NPCs — expand the humanoid set (Adam's ruling 2026-07-08)

NPCs have no per-NPC model. As of the cuboid fix they resolve to a **best-candidate humanoid** via
`theaterNpcModelFor` (theater-data.js) — a keyword→model map defaulting to `commoner`
(commoner/noble/guard/cultist/bandit exist). The tabletop rule: *no model → nearest candidate*.
As the NPC model set grows, extend that one map (the NEAREST_SUB pattern). Candidate additions worth
building: villager/townsfolk variants, merchant, elder, child, laborer, priest, soldier, innkeep.

## What was fixed vs. what remains authoring

**Fixed in code (branch `fix/standing-tableau-cuboids`, 2026-07-08):** the standing tableau now paints
outside combat; cast figures (NPC/companion/corpse/ambient) carry resolvable render keys instead of
cuboiding; the 8 bespoke realm-prop models (`prop:sentry-turret-mount`, `prop:conveyor-spur`,
`prop:holo-pillar-ad`, `prop:blast-shutter-frame`, `prop:shroud-draped-loom`,
`prop:sin-eaters-bowl-stand`, `prop:charnel-pit`, `prop:whispering-curtain-row`) now render (were dead
via a `model`-vs-`part` field bug); model-path instrumentation added (`window.Theater.modelPathReport()`).

**Remains authoring (this doc):** the 42 creature bespoke builds, the 14 prop models, the NPC model set.
None is a wiring bug — all are art the swap-cheap seams are ready to receive.
