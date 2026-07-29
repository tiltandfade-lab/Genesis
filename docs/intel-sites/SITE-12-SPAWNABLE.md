---
type: spawn-audit-inventory
created: 2026-07-27
site: 12 — anomalous / living / mobile
spec: ../SITE-12-ANOMALOUS-LIVING-MOBILE-SPEC.md
research: ../../Reference/Anomalous-Living-Mobile-Study-0727/
---

STATUS: RECONCILED SOURCE INVENTORY — NO IMPLEMENTATION AUTHORITY (2026-07-28)

# SITE 12 — SPAWNABLE CONTENT INVENTORY

## 2026-07-28 adversarial reconciliation

Site 12 proves the shared `SubstratePlan` plus terminal transformation. Its axes—support,
capacity, datum, anchor/mobility, agency, transform, and tenure—are orthogonal; no S0–S7
ladder owns them. Thickness, anchor fields, trusted paths, clocks, perimeters, ownership, and
tenancy are conditional profile facts. Terminal transformation may destroy the former host
substrate and requires a separately resolved resulting host. Megastructure remains an ordinary
host composed with anomalous substrate and optional `ScaleContract`. The 13.48% tag rate is
not measured Site-12 activation.

Every concrete thing the Site 12 working spec implies can **spawn in play**, mapped to the
Engine table or roller that would produce it — or marked `NO-TABLE-YET`.

This feeds the spawn-audit lane. It is an inventory, not a build order, and it changes
nothing.

## How to read the status column

| status | meaning |
|---|---|
| `LIVE` | a player-facing roller calls the table today; verified by reading the consumer |
| `LIVE-TRUNCATED` | the roller calls it but discards columns that carry the content Site 12 needs |
| `AUTHORED-UNWIRED` | the rows exist in editable source; no code path calls them |
| `ORACLE-MANUAL` | reachable outside the player-facing path (a procedure doc, the Oracle tab) |
| `LIVE-COMPOSED` | reachable by synthesising two or more live axes; no single row names it |
| `NO-TABLE-YET` | nothing in the Engine produces this; it is coverage debt |

**Wiring evidence.** The `LIVE` marks below were established by listing every table id the
three walks actually roll:

```
grep -o 'walkPick("[a-z0-9-]*"\|walkPickStamped("[a-z0-9-]*"\|rollTable("[a-z0-9-]*"' \
  src/engine/walk.js src/engine/wild-walk.js src/engine/dungeon-walk.js | sort -u
```

plus per-id greps in `src/`. Where `data/table-usage.js` and the code disagree, the code is
treated as authoritative (see §8.2a of the spec for the `urban-footing` case).

---

## 1. Substrate and surface — shared `SubstratePlan` inputs

| what spawns | table / roller | status | note |
|---|---|---|---|
| the settlement itself, as a substrate-anomaly place | `place-master-setting` → `src/creator/bardo.js:14`, `src/engine/codex-roll.js:660` | `LIVE` | 15 of 100 rows; bands Grounded→Mythic; incl. Drowned Port, Ice-Road Town, Old Oak Wharf, Mire-End, Shimmering Maw, Dorsal Market, Living Tapestry, Fracture-Market, Anvil-of-Morning |
| a living or impossible dungeon | `dungeon-type` rows 98–100 → `src/engine/dungeon-walk.js:613` | `LIVE` | Living Hive ×1; Megastructure ×2 remains an ordinary host that may compose with anomalous substrate and optional `ScaleContract` |
| the walking surface, by flavour | `wilderness-footing` col 1 → `src/engine/wild-walk.js:182` | `LIVE` | 200 rows, incl. Spongy Peat, Foul Bog, Thin Ice / Fragile Crust, Cooled Lava Flow, Petrified Wood / Smooth Coral Plateau, Dried Algae Crust |
| **the surface's coverage geometry** ("One 20×20 patch", "Outer Perimeter", "10-foot wide strip", "25% of Area") | `wilderness-footing` col 2 | **`LIVE-TRUNCATED`** | authored, rolled, **and discarded** — `walkPick(…, 1)` takes column 1 only. This can serve profiles that commit a perimeter or patch; not every substrate requires one |
| **the surface's load limit** ("breaks if weight exceeds 3d10×10 lbs in a 10-ft square; fall through") | `wilderness-footing` col 3 | **`LIVE-TRUNCATED`** | same call; the load-band relation is authored and never delivered |
| urban walking surface: boardwalk, rotting boardwalk, missing planks, makeshift plank, flooded street, deep mud, shallow water | `urban-footing` | **`ORACLE-MANUAL`** | no code consumer; only `Engine/02. _Procedures/Urban Encounter v2.5.md` references it. The entire trusted-path failure grammar is unreachable from the urban walk |
| tactical terrain features | `wilderness-tactical-terrain` → `wild-walk.js:45`; `urban-tactical-setup` → `walk.js` | `LIVE` | the general terrain layer a substrate skin would ride |
| substrate material read (what the floor is *made of*) | `architecture-material` | `AUTHORED-UNWIRED` | no src consumer found |
| substrate **thickness**, and what is beneath it | — | **`NO-TABLE-YET`** | conditional support/capacity fact; no table states a floor's depth or its underside |
| **datum pair** (a committed high state and low state over one id set) | — | **`NO-TABLE-YET`** | conditional datum-axis expression; the engine has no two-state surface concept |
| the **perimeter halo** (dead/marked transition outside an anomaly) | — | **`NO-TABLE-YET`** | conditional boundary profile; partially expressible via `wilderness-footing` col 2 if that column were read |

## 2. Structures

| what spawns | table / roller | status |
|---|---|---|
| ordinary buildings sitting on the substrate | Place Spine archetypes / building kits; `building-interior` | `LIVE` |
| dungeon room shapes the substrate can skin | `dungeon-area-type`, `dungeon-topology` → `dungeon-walk.js` | `LIVE` |
| wilderness clearing shape/dimensions | `wilderness-area-type` → `wild-walk.js` | `LIVE` (a shape string, not a site — see `intel/walk-census.md` caveat 1) |
| plank spine / boardwalk segment (fixed) | `urban-footing` 31–32 | `ORACLE-MANUAL` |
| plank spine (removable) — a lifted or laid plank as a route change | — | **`NO-TABLE-YET`** |
| gangway / ramp with run-out and stowed states | — | **`NO-TABLE-YET`** |
| stake, driven pile, mooring bitt, cleat — an **anchor field** | — | **`NO-TABLE-YET`** (conditional anchor/mobility-axis expression; signature of the raft proof profile, not every substrate) |
| pontoon / float mass | — | **`NO-TABLE-YET`** |
| piling forest / under-deck frame (the "underside" zone) | — | **`NO-TABLE-YET`** |
| the **fast point** (mast, post, bitt, ridge, outcrop) | — | **`NO-TABLE-YET`** (raft/mooring proof-profile deck) |
| marker post carrying a datum scale | — | **`NO-TABLE-YET`** |
| crust panel, and its breached variant exposing subgrade | — | **`NO-TABLE-YET`** |
| plate-and-gap terrain (archipelago over void) | — | **`NO-TABLE-YET`** (FFT-106 posture; pure subtraction from existing terrain) |
| rim terrain (ground around a central void) | — | **`NO-TABLE-YET`** (FFT-114 posture) |
| growing joint (living-substrate anchor) | — | **`NO-TABLE-YET`** |
| doors, hatches, and their states | `dungeon-door-type`, `dungeon-door-state` → `src/world/wiring-b.js` | `LIVE` |
| exits and their states | `dungeon-exit-state`, `urban-exit-state` | `LIVE` |

## 3. Mechanisms and interactables

| what spawns | table / roller | status |
|---|---|---|
| generic interactable objects | `dungeon-interactable-object` → `dungeon-walk.js`; `urban-interactable-object`, `wilderness-interactable-object` → `src/world/wiring-a.js` | `LIVE` |
| anchor verbs: drive · cut · re-set · foul | — | **`NO-TABLE-YET`** |
| mooring verbs: make fast · slip · warp | — | **`NO-TABLE-YET`** |
| gangway verbs: run out · draw in · stow | — | **`NO-TABLE-YET`** |
| plank verbs: lay · lift | — | **`NO-TABLE-YET`** |
| substrate patch verb: add a layer (raises a load band) | — | **`NO-TABLE-YET`** — the Uros two-week reed cadence, mechanised |
| crust verbs: sound it · breach it | — | **`NO-TABLE-YET`** |
| sluice / hatch / plug: open · close (the datum lever) | — | **`NO-TABLE-YET`** |
| winch or capstan for warping a parted raft | — | **`NO-TABLE-YET`** |
| the host's own mechanism (breathing aperture, shifting plate, closing ring) | — | **`NO-TABLE-YET`** |
| tithe gate: pay · defer · refuse | `urban-commerce` → `walk.js` gives a commerce beat, **not** a tenancy transaction | `LIVE-COMPOSED` at best; the tenancy verb is **`NO-TABLE-YET`** |

## 4. Occupants

| what spawns | table / roller | status |
|---|---|---|
| the site's people, by role | `npc-role`, `npc-role-megatable` family; `npc-role-spine` | mixed — `npc-role-spine` has no src consumer; the role skins (`npc-role-skin-*`) are generated data |
| dug-in threats | `dungeon-threat-identity-t1/t2`, `urban-threat-identity-t1/t2` → the walks | `LIVE` |
| enemy composition | `dungeon-enemy-category` / `-composition`, urban and wilderness equivalents | `LIVE` |
| the substrate's **owner / counterparty**, when tenure is committed (keeper caste, tithe-keepers, the host itself) | `faction-basic` + `patron-archetype` + `npc-resource-control` | `LIVE-COMPOSED` for the faction; `npc-resource-control` has **no src consumer** |
| a **tenant in arrears**, when tenure is committed — standing per party against the substrate's owner | — | **`NO-TABLE-YET`** |
| the maintainer caste (who adds reed, re-drives stakes, re-lashes) | — | **`NO-TABLE-YET`** |
| the **host organism** itself as a rolled entity, for living-host profiles | `animal-kind` / `wild-animal-kind` → `codex-roll.js` produce animals; nothing produces a *gargantuan inhabited host* | `NO-TABLE-YET` for the host role |
| **encrusting colonists** — the barnacle/lice register: things anchored to a living host that are neither threat nor NPC | — | **`NO-TABLE-YET`** |

## 5. Situations, hooks, problems

| what spawns | table / roller | status |
|---|---|---|
| the world's substrate transform: **The Becoming** (d8) | `SS.cBecoming` via `concretize()` ← `rollPressure()` ← `rollStartingState()` (`src/engine/world-gen.js:29`) | **`LIVE`** — fires at every world genesis; ≈13.5% of worlds carry a Becoming or Intrusion |
| **The Intrusion** (d6) + its manifestation (d4: fixed doorway · wandering fold · spreading tide · scattered bleed-points) | `SS.cIntrusion`, `SS.cIntrusionManifest` | **`LIVE`** |
| **The Buried Power** rows 1 / 2 / 8 (sleeper beneath · structure surfacing · land reverting to an older shape) | `SS.cBuried` | **`LIVE`** |
| the terminal transformation ("the place becomes something else and will not change back") | `SS.doom` / Impending Doom d12 row 12 | **`LIVE`** as story pressure; resulting-host resolution is absent |
| the pressure's advancing clock | `w.pressures[].clock` + `SS.grimPortent` → `src/world/turn.js` | `LIVE` |
| generic problems and hazards | `dungeon-problem`, `urban-problem`, `wilderness-problem`, `dungeon-hazard`, `urban-hazard`, `wilderness-hazard` | `LIVE` |
| a parted mooring / a raft adrift | — | **`NO-TABLE-YET`** |
| a maintenance strike or refusal | — | **`NO-TABLE-YET`** |
| a stranger who does not know the clock | — | **`NO-TABLE-YET`** |
| a rival driving new stakes (claim by anchor) | — | **`NO-TABLE-YET`** |
| someone selling title to ground that will not exist at the next phase | — | **`NO-TABLE-YET`** |
| the host stirring early | — | **`NO-TABLE-YET`** |
| site secrets | `place-secret` → `codex-roll.js`; `dungeon-secret-*` → `dungeon-walk.js`; `urban-secrets` (**no src consumer**) | mixed |
| myth becoming terrain | `myth-becomes-geography` | `AUTHORED-UNWIRED` — directly relevant to the Becoming and unreachable |

## 6. States

| what spawns | table / roller | status |
|---|---|---|
| dressing condition (worn, damaged, fresh…) | `dungeon-set-dressing-condition`, `urban-set-dressing-condition`, `wilderness-set-dressing-condition` | `LIVE` |
| **per-anchor hold state** (secure / slipping / parted / re-set), when anchors are committed | — | **`NO-TABLE-YET`** |
| **per-surface integrity** (sound / strained / critical / failed) | partially in `wilderness-footing` col 3 | `LIVE-TRUNCATED` |
| **clock phase** (tide, season, drift, growth, rot, spread), when a substrate clock is committed | pressure clocks exist; a *substrate* clock does not | `NO-TABLE-YET` |
| **current datum** and which ids sit above/below it | — | **`NO-TABLE-YET`** |
| **circulation continuity** per path segment | — | **`NO-TABLE-YET`** |
| **tenancy standing** (paid / owed / in arrears / barred), when tenure is committed | — | **`NO-TABLE-YET`** |
| **host mode** (calm / stirring / acting / spent) with cause and recovery, for agentic/living-host profiles | — | **`NO-TABLE-YET`** |
| **front position and rate** for a Becoming | the pressure clock gives a rate; a *spatial* front does not exist | `NO-TABLE-YET` |
| world drift over time | `place-drift` → `src/world/turn.js` | `LIVE` |

## 7. Dressing, props, decals

| what spawns | table / roller | status |
|---|---|---|
| set dressing | `dungeon-set-dressing`, `urban-set-dressing`, `wilderness-set-dressing` → the three walks | `LIVE` |
| dressing mega-tables | `dungeon-dressing-mega-table`, `wilderness-dressing-mega-table` | authored; the walks roll the non-mega variants |
| furniture and clutter | `furniture-clutter` | `AUTHORED-UNWIRED` |
| **anchor scars** — the record of former occupancy in anchor-using profiles | — | **`NO-TABLE-YET`** (identity-bearing state, not free dressing) |
| waterline / tide-stage marks at **both** datums | — | **`NO-TABLE-YET`** |
| claim marks on maintained patches | — | **`NO-TABLE-YET`** |
| tally board at the tithe gate | `urban-commerce` can produce a commerce beat; the tally board is not a rolled object | `NO-TABLE-YET` |
| the sounding line (the tool that reads the substrate) | — | **`NO-TABLE-YET`** |
| spare plank, reed bundle, maul and stake stock, coiled line | — | **`NO-TABLE-YET`** |
| loot on the site | the `dungeon-loot-*` family → `dungeon-walk.js` | `LIVE` |
| salvage from a parted raft | — | **`NO-TABLE-YET`** |

## 8. Light and sensory

| what spawns | table / roller | status |
|---|---|---|
| dungeon lighting | `dungeon-lighting` → `dungeon-walk.js` | `LIVE` |
| urban lighting | `urban-lighting` | **not rolled by the urban walk** — `AUTHORED-UNWIRED` |
| wilderness lighting / weather | `wilderness-lighting-weather` | **not rolled by the wilderness walk** — `AUTHORED-UNWIRED` |
| sensory beats | `dungeon-sensory`, `urban-sensory`, `wilderness-sensory` | `LIVE` |
| smell / sound atmospherics | `atmosphere-smell`, `atmosphere-sound` | `AUTHORED-UNWIRED` |
| substrate-owned light (bioluminescence, luminous crust, host glow) | — | **`NO-TABLE-YET`**; would be gated by THE CAUSAL LIGHT LAW |
| reflected/refracted bounce off water, ice, glass as a legibility budget | — | **`NO-TABLE-YET`** (renderer concern, recorded here because the spec relies on it) |
| **the felt register** — quake, roll, working timbers, breathing | — | **`NO-TABLE-YET`**, and per spec §15.4 gap 5 it may not be solvable in a fixed-camera diorama at all |

## 9. World context projection

| what spawns | table / roller | status |
|---|---|---|
| nearby places and their relations | `place-nearby` → `src/world/wiring-b.js` | `LIVE` |
| place history / mythology / drift | `place-history`, `place-mythology`, `place-drift` | mixed; `place-drift` is `LIVE` |
| environment skin over the walk | `dungeon-environment-skin` → `dungeon-walk.js`; `urban-environment-skin` → `walk.js`; `walk-skin-*` | `LIVE` |
| **a surround that changes while the site does not** (the mobile-site context case) | — | **`NO-TABLE-YET`**; the spec (§12.7) proposes this as Site 12's best available proof of the context-projection contract |
| a Site-12 world-context receipt | `GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md` requires one | **not yet rolled** |

---

## Headline counts

Three buckets, because "authored" and "delivered to play" are different claims:

- **delivered** — `LIVE` or `LIVE-COMPOSED`; a player-facing roller produces it today;
- **authored, not delivered** — `LIVE-TRUNCATED`, `AUTHORED-UNWIRED`, or `ORACLE-MANUAL`;
  the rows exist and play cannot reach them;
- **none** — `NO-TABLE-YET`; coverage debt.

| section | delivered | authored, not delivered | none |
|---|---:|---:|---:|
| 1 substrate & surface | 4 | 4 | 3 |
| 2 structures | 5 | 1 | 11 |
| 3 mechanisms | 1 | 0 | 10 |
| 4 occupants | 4 | 0 | 4 |
| 5 situations & hooks | 7 | 1 | 6 |
| 6 states | 2 | 1 | 7 |
| 7 dressing & props | 2 | 2 | 7 |
| 8 light & sensory | 2 | 3 | 3 |
| 9 world context | 3 | 0 | 2 |
| **total (95 items)** | **30** | **12** | **53** |

Read plainly: **just under a third of what Site 12 implies can spawn today**, an eighth is
written but unreachable, and a little over half does not exist. The middle column is the
cheap third — nothing in it needs authoring, only consuming.

## The three findings this inventory hands to the spawn-audit lane

1. **`wilderness-footing` is live and column-truncated.** `wild-walk.js:182` calls
   `walkPick("wilderness-footing", 1)`. Columns 2 (Coverage Area) and 3 (Mechanical Impact
   & Tracking) are discarded — including a rolled load limit ("breaks if weight exceeds
   3d10×10 lbs in a 10-ft square") and the patch/perimeter coverage vocabulary. **200
   authored rows are delivering one third of their content.** This is not a Site 12
   problem; it is a walk-consumption-boundary problem that Site 12 happened to find.

2. **`urban-footing` has no code consumer.** 100 authored rows carrying the boardwalk /
   rotting-boardwalk / missing-planks / makeshift-plank / flooded-street grammar are
   reachable only from a procedure markdown. `data/table-usage.js` records it as `WIRED`
   with `consumers.code: ["table-atlas.js"]`; `table-atlas.js` is a generated index, not a
   caller. **The usage classification and the code disagree, and the code is right.** That
   discrepancy is worth checking across the whole registry.

3. **The irreducible buy is a shared `SubstratePlan`, not an anchor field.** The 53
   `NO-TABLE-YET` items cluster under orthogonal support, capacity, datum, anchor/mobility,
   agency, transform, and tenure axes. Anchor state/scars, datum pairs, thickness/underside,
   tenancy, and host mode are conditional expressions selected only when the rolled profile
   needs them. Almost everything else is either an existing table that is not being read or
   a subtraction from terrain the engine already builds.

## Boundary

This inventory changed nothing. It edits no table, no roller, and no shared file. The
`LIVE` / `AUTHORED-UNWIRED` / `ORACLE-MANUAL` marks are proposed for
`GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md` and are not yet recorded there.
