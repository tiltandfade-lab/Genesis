---
type: working-site-spec
project: Genesis
status: DRAFT — Opus lane 2026-07-27
created: 2026-07-27
authority: GOLDEN-SITE-CONCEPTING-GUIDELINES.md "Governing law" · ART-DIRECTION-CANON.md · GRAPHICS-CONVERGENCE-CHARTER.md
lane: Genesis-clayspec / docs/clayroom-terrain-materials
evidence:
  - intel/walk-census.md
  - intel/walk-census-tally.json
  - intel/marathon-spatial-mining.md
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Area Type.md"
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Tactical Terrain.md"
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Feature.md"
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Footing.md"
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Biome Type.md"
  - "Engine/03. _Tables/03. Session Mechanics/Dungeons/Room Elevation Profile.md"
related:
  - "[[CLAYROOM-RESET-LADDER]]"
  - "[[STRUCTURE-KIT-CATALOG]]"
  - "[[MESHY-WILDERNESS-SETPIECE-QUEUE]]"
  - "[[SETTLED-LIFE-SITES-PROGRAM]]"
  - "[[SPICE-CURVE]]"
  - "[[BATTLEMAP]]"
---

# STATUS: DRAFT — Opus lane 2026-07-27

# THE TERRAIN PROGRAM

Proving terrain in the clayroom for the tactical battlemat.

**Nothing here is built, budgeted, or authorized.** This is a specification. No code was
written; no existing document was modified; every visual verdict in it is Adam's.

Adam's brief, 2026-07-27 (verbatim): *"we need to prove our terrain in the clayroom, we
might need several tree models from meshy, ideally we don't want too many trees that
interfere with tactical play, so giant roots or branches you can climb on are encouraged
(those could be made in engine). if things are made in engine make sure they are procedural
and that they can be morphed resized stretched etc. things we for sure need are cliffs,
crevices, chasms, ponds, puddles, hills, mountainsides etc, be sure to consider different
styles of terrain so that we have a diverse world, not just the easiest generic terrain,
though we should start with the easiest generic terrain first, make sure to draw from what
actually rolls in the world, but also survey what's missing from the rolls that would serve
a fun strategic battlemat and spec that if it is missing."*

---

## 0. The one-paragraph finding

**The tables already roll far more terrain than anyone has been building, and they roll it
with dimensions.** One in three wilderness arrivals is walled by a named hard elevation
boundary — a twenty-foot sheer cliff or a ten-foot earthen bank — and the renderer builds
neither. The wilderness landmark table carries an explicit *Dimensions (Footprint &amp; Height)*
column; the tactical-terrain table carries an explicit *Map Footprint* column on all fifty
rows; and the harness itself documents that the footprint column never reaches the engine.
So the terrain program is **not** mostly a table-authoring job. It is mostly a
**geometry-and-wiring** job against tables that are already ahead of the renderer — plus a
short, specific list of genuinely missing rows, of which the largest is that a biome named
"Hill" rolls 11% of the time and there is no hill anywhere in the corpus.

---

# 1. THE DEMAND TABLE

## 1.1 Method and honesty bar

Two evidence sources, both already in the repo, plus a direct read of the Engine table
markdown. No new dice were rolled for this document.

- **`intel/walk-census.md` + `walk-census-tally.json`** — 1,050 walks rolled against the
  built engine (450 frontier · 300 travel · 300 job), of which **539 wilderness arrivals**
  and **2,112 wilderness legs**. Unseeded `Math.random()`; re-running reproduces the *shape*
  of the distribution, not the exact counts (census §4 caveat 7). Every count below over
  ~20 instances is safe; single-digit counts are within noise of each other.
- **`intel/marathon-spatial-mining.md`** — 37 distinct spatial inventions mined from the
  2026-07-07 marathon transcripts (~570 KB / 11 sets, two PCs).
- **The Engine table markdown**, read directly. `tables.js` / `tables.json` were never
  opened, per the standing rule. Percentages taken from the table structure itself are
  **exact** (a 300-row table with a strict 50 × 6 product has exactly 16.67% per boundary),
  and are labelled as such to distinguish them from sampled census percentages.

Where a classification below is mine rather than a founder ruling or a table's own column,
it says so. The reproduction script for the terrain classification in §1.4 is
`terrain-classify.py`, method disclosed inline.

## 1.2 What terrain actually rolls today

### A. The arrival envelope — `wilderness-area-type` (d300)

This is the table the census called `areaType` and correctly identified as *not* a site
name. It is more interesting than that. It is a **strict 50 shapes × 6 boundary types
cartesian product**, verified by parse: 300 rows, 50 distinct shape strings each appearing
exactly 6 times, 6 distinct boundary strings each appearing exactly 50 times.

**The playfield (column 2) — 50 sized shapes, 35 base shape families.** Census, n=539:

| bucket | inst. | % | distinct shapes |
|---|---:|---:|---:|
| flat outline (star, circle, oval, kidney, diamond, octagon, square, trapezoid, wedge) | 250 | 46.4% | 11 |
| corridor grammar (junction, U-turn, S-curve, L-shape, funnel, parallel tunnels, winding trail, hollow square) | 181 | 33.6% | 17 |
| **relief-named** (Rectangular Basin, Oval Basin, D-Shape Basin, Oval Valley, Large Valley, Narrow Gorge, Zig-Zag Pass) | **108** | **20.0%** | 7 |

Footprints run **20′×20′ to 80′×80′**, every axis a multiple of 10′. In five-foot cells:
**minimum 16 cells, median 96, maximum 256.** Corridor shapes carry an explicit width
parenthetical — 10′ wide (33 inst.), 20′ wide (78), 30′ wide (25).

**The boundary (column 3) — exactly six, exactly uniform. This is the finding.**

| boundary (verbatim) | share of every arrival | est. inst. of 539 | what it is |
|---|---:|---:|---|
| `20-foot high sheer rock / ice cliffs.` | **16.67%** | ~90 | an 8h vertical face, the full tray perimeter |
| `Steep 10-foot earthen/snow banks.` | **16.67%** | ~90 | a 4h bank — exactly one storey |
| `Deep, rushing water / hazardous mud.` | **16.67%** | ~90 | a water/mud edge |
| `Impassable thorny brush / razor-sharp coral.` | 16.67% | ~90 | a vegetation volume |
| `Dense, impassable tree/stalagmite trunks.` | 16.67% | ~90 | a trunk field |
| `Thick, choking fog / spore clouds.` | 16.67% | ~90 | an obscurement volume |

> **33.3% of every wilderness arrival is enclosed by a named hard elevation boundary, and
> 16.7% by water. That is ~180 cliffs-or-banks and ~90 water edges in 539 arrivals — the
> single most-rolled terrain in the game — and the renderer builds none of it.**

**The tactical features (column 4) — route and relief grammar, already authored per row.**
Keyword parse over all 300 rows:

| names a… | rows | % of 300 |
|---|---:|---:|
| entry / exit / path / trail | 283 | **94.3%** |
| difficult terrain | 49 | 16.3% |
| an explicit vertical dimension | 42 | **14.0%** |
| choke / narrow / squeeze | 38 | 12.7% |
| cover | 37 | 12.3% |
| obscurement | 34 | 11.3% |
| alcove / pocket | 27 | 9.0% |
| ledge / shelf | 25 | 8.3% |
| bridge / span | 23 | 7.7% |
| pit | 14 | 4.7% |
| pillar | 14 | 4.7% |
| slope / ramp | 6 | 2.0% |

Verbatim samples: `"10' wide sloped exit north; a 5' deep natural pit in one corner."` ·
`"10' wide path at the base; a 5' wide ledge 10 feet up lines the point."` ·
`"20' wide path with two sharp turns; the trail slopes upward 20 feet."` Explicit vertical
dimensions used: 5′ ×13, 10′ ×23, 15′ ×1, 20′ ×2, 40′ ×1.

### B. The terrain roller — `wilderness-tactical-terrain` (d50)

The real terrain table, and a good one: every row carries a **Map Footprint** and a
**Mechanical Impact (2024 RAW)**. Footprints parse to **1–28 cells, median 5, mean 7.86**
(44 of 50 rows parse; 6 give a shape rather than a rectangle).

Its own how-to-use line: *"roll 1d4 times on this table and draw these elements onto the
grid."*

**Wiring status — LIVE, but three times narrower than authored.** `src/engine/wild-walk.js:45`
draws it, inside `wwalkEncounter`, on the `Enemy`/`Combat` branch only:

```js
const [terrain]=walkPick("wilderness-tactical-terrain",1);
```

Three separate narrowings, each measurable:

| narrowing | measured effect |
|---|---|
| **Combat-only.** The draw sits inside the enemy branch. | Enemy is **29.0%** of 2,112 wilderness legs. 71% of legs get no terrain draw at all. |
| **One draw, not `1d4`.** `walkPick(...,1)`. | The engine supplies **40%** of the authored density (1 vs a mean of 2.5). |
| **Footprint column not compiled.** `dev/verify-battlemap.mjs:381`, verbatim: *"no wilderness-tactical-terrain 'Map Footprint' column exists in the compiled tables yet."* | The one row that does arrive arrives **without geometry**. |

Compounded: mean footprint 7.86 cells against a median 96-cell tray is **8.2% coverage at
one draw**, **20.5% at the authored 1d4** — and today, on 29% of legs, at zero built cells.

### C. The landmark roller — `wilderness-feature` (d303)

Header: `|d303|The Landmark (Flavor)|Dimensions (Footprint &amp; Height)|Tactical Effect|`.
**It carries heights.** The census only ever tallied its name column, which is why the
census read it as a curiosities generator; the dimensions were there all along.

Terrain rows, verbatim:

```
|**145**|Overhanging Cliff: A shear drop-off dominating the map.|40' long, 30' high cliff|Total cover from above/below. DC 15 Athletics to scale.|
|**144**|Chasm with Landbridge: A natural stone span over a void.|5' wide bridge, 30' drop|Choke point. Falling is a severe hazard.|
|**143**|Stepped Sinkhole: Depression falling away in 5' tiers.|30' diameter, 15' deep|Provides cover based on depth. Elevation advantage for edge.|
|**067**|Meteoric Crater: Impact zone from a fallen star.|40' diameter, 10' deep|Edges grant Half cover. Interior is Difficult terrain.|
|**171**|Petrified Waterfall: A cascade of water turned to solid stone.|20' wide, 40' high|Grants a natural, climbable ramp (DC 10 Athletics).|
|**157**|Algae-Choked Pond: Water covered in thick green slime.|20' diameter|Heavily Obscured underwater.|
|**236**|Oasis / Hot Spring: A small pool of perfectly clear water.|20' diameter pool|Normal terrain. Water is deeply refreshing.|
|**250**|Geyser Crater: A mineral-stained bowl that occasionally vents.|20' diameter, 5' deep|Provides cover inside. Hazard: Vents steam randomly.|
|**150**|Hollow Rock: A boulder with a cave-like interior.|15' diameter, 10' high|Total cover. Interior holds up to 3 Medium creatures.|
|**233**|Crystal Cave Mouth: A tunnel entrance lined with geodes.|10' wide, 10' high|Choke point. Retreating into it limits flanking.|
```

**Cliffs, chasms, and ponds do roll, with dimensions and climb DCs.** They are simply not
built.

### D. The ground roller — `wilderness-footing` (d200)

`|d200|Surface Flavor (Biome Agnostic)|Coverage Area|Mechanical Impact &amp; Tracking|`.
Banded by severity, not biome: **001–080 normal movement (40%) · 081–140 difficult
terrain (30%) · 141–200 hazard (30%)**. The *Coverage Area* column is a ready-made
placement grammar: `100% of Area` · `50%` · `25%` · `5-foot wide path` · `10/15-foot wide
strip` · `10x10 patch` · `20x20 patch` · `1d4 5x5 patches` · `1d4 10x10 patches` ·
`1d6 5x5 patches` · `Two 10x10 patches` · `Outer Perimeter`.

### E. The biome roller — `wilderness-biome-type` (d10)

Rolls evenly. Census n=539 arrivals / 2,112 legs:

| biome | arrivals | % | legs | % |
|---|---:|---:|---:|---:|
| Forest | 77 | 14.3% | 252 | 11.9% |
| Mountain | 67 | 12.4% | 268 | 12.7% |
| Arctic | 66 | 12.2% | 269 | 12.7% |
| Swamp | 63 | 11.7% | 237 | 11.2% |
| Grassland | 63 | 11.7% | 234 | 11.1% |
| **Hill** | **60** | **11.1%** | 226 | 10.7% |
| Desert | 59 | 11.0% | 242 | 11.5% |
| Coastal | 52 | 9.7% | 192 | 9.1% |
| Underwater | 16 | 3.0% | 109 | 5.2% |
| Deeplands | 16 | 3.0% | 83 | 3.9% |

**And it does nothing.** The table has two columns beyond the die — Biome Type and
Descriptive Flavor. No ground, no movement, no feature data. Every mechanical terrain table
is explicitly headed *"Biome Agnostic."* Biome does not gate or weight any of them.

> **An Arctic arrival and a Desert arrival roll identical footing, identical tactical
> terrain, and identical landmarks. This is the direct, mechanical reason the world is not
> visually diverse — and it is the exact thing Adam's "different styles of terrain" line
> is asking for.**

### F. The census's own terrain classification

Applying an explicit head-name map to the 539 wilderness arrivals (classification mine,
counts real, reproducible via `terrain-classify.py`):

| class | inst. | % of 539 | distinct rows |
|---|---:|---:|---:|
| T1 elevation / rock landform | 45 | 8.3% | 15 |
| T5 vegetation / climbable organic | 27 | 5.0% | 13 |
| T2 negative space (chasm, crevice, pit, cave mouth) | 25 | 4.6% | 11 |
| T3 water body | 21 | 3.9% | 9 |
| T6 traversal furniture over terrain | 13 | 2.4% | 8 |
| T4 ground-state / surface hazard | 11 | 2.0% | 7 |
| **total terrain-classifiable** | **142** | **26.3%** | **63** |

Read this against §1.2A: the *arrival feature* is terrain only 26% of the time, but the
*arrival boundary* is hard terrain 50% of the time (cliff, bank, or water). The boundary is
the bigger, more reliable, and completely unbuilt signal.

## 1.3 What the strategic battlemat needs

`GOLDEN-SITE-CONCEPTING-GUIDELINES.md` "Governing law" — the checklist, verbatim, scored
against what terrain supplies today.

| the law asks | terrain's job | supplied today? |
|---|---|---|
| What interesting decision does this place create that another level does not? | the shape of the ground is the difference between two trays with identical encounters | **NO** — biome is inert; every tray's ground is drawn from the same biome-agnostic pool |
| Are there at least two viable approaches with different advantages, risks, consequences? | routes: a fast exposed crossing vs a slow covered one | **PARTIAL** — 94.3% of area-type rows name an entry/exit, but entries aren't built as geometry |
| Can the player change the situation by understanding and using the site? | collapsible, floodable, climbable, blockable ground | **NO** — rows 28/44/48 of the d50 are the only mutable ground, and none is built |
| Do position, routes, **elevation**, **cover**, **hazards**, **timing**, occupants, light, objectives create tradeoffs? | all five terrain-owned axes | elevation **rolled, unbuilt** · cover **rolled, unbuilt** · hazards **rolled, unbuilt** · routes **rolled, unbuilt** · **timing: not rolled at all** |
| Can the player recognize what changed after a choice? | the ground must visibly deform | **NO** |
| Is approach, commitment, failure, retreat, recovery possible? | terrain owns retreat — the way back must be readable and losable | **NO** |
| Does the layout remain interesting across changed seeds? | terrain must vary parametrically, not by asset swap | **untested** — no terrain fixture exists |

And the marathon's own ranked demand list (`marathon-spatial-mining.md` §3), which is play
evidence rather than table evidence:

| rank | demand | findings | terrain's share |
|---:|---|---:|---|
| 1 | Sightline/cover geometry for stakeout, stealth, ambush | 7 | the cover half is terrain's |
| 2 | **Elevation + unstable terrain as tactical ground** | 7 | **entirely terrain's** |
| 3 | Institutional interior with custody | 3 | not terrain |
| 4 | **Water/flood hazard as recurring dramatic architecture** | 5+ | **entirely terrain's** |
| 5 | Small discoverable props | 8 | not terrain |
| 6 | Light as danger telegraph | 4 | shared |
| 7 | Establishing exteriors | 6 | shared |
| 8 | Vertical shaft grafted onto a mundane building | 2 | terrain's negative-space half |

Two of the top four demands are pure terrain. And the load-bearing detail: **two players,
in two separate sets, independently invented the same trick unaided** — bait an enemy onto a
narrow unstable edge and let the ground do the killing (set-05 T8, a wet plank between
ironwood pilings; set-09 T8, a tripline at a slick glass lip). Nobody prompted that. It is
the strongest single signal in the corpus for what terrain must be able to do.

## 1.4 THE MISSING LIST — specced

Twelve items. Each is a real gap, each carries its evidence, and each is specced far enough
to hand to the owning lane. **Ownership is split three ways:** the table lane owns rows, the
engine lane owns geometry and wiring, and the compile lane owns columns.

### M1 — Hills do not exist. *(table + engine)*

`wilderness-biome-type` row 6 is `**Hill**|Rolling elevations, rugged highlands, and deep
green valleys.` — 11.1% of arrivals. There is no hill anywhere in the corpus. The nearest
rows are `Earthen Berm / Low Ridge` (5′ wide, 20′ long — a berm, not a hill) and
`Terraced Steps`. A broad convex rise you fight *up* is not rollable.

**Spec:** one new `wilderness-tactical-terrain` row and one engine piece (R1-02).
Proposed row — `**Low Hill / Rolling Rise:** A broad convex swell of ground. | 25'x25'
crown, 5-10' rise | **Elevation.** Advantage on melee attacks against targets at least one
step lower. Climbing the flank costs 5 extra feet per 5-foot rise.`

### M2 — Ordinary puddles do not exist. *(table)*

The only puddle in the corpus is `Boiling Puddle / Magma Seep` (d50 row 37), a fire hazard.
Standing shallow water as an *information* surface — reflection, tracks, noise — has no row.
This matters because marathon demand #1 is stakeout/stealth sightline geometry, and a puddle
is the cheapest sightline tool that costs zero movement.

**Spec:** one new footing row and one new tactical row. Proposed tactical row —
`**Standing Puddles / Meltwater Sheet:** Rainwater lying on hardpan. | 1d4 10x10 patches |
**Trace &amp; Sound.** Crossing at more than half speed is audible (Stealth automatically fails).
A creature can use an Investigation check to read tracks left within the last hour. Reflects
light: a creature can see around a corner across the surface with a DC 13 Perception check.`

### M3 — Mountainsides do not exist. *(engine)*

`20-foot high sheer rock / ice cliffs` (16.67% of arrivals) is a 20-foot *wall*, not a
continuing slope. Biome `Mountain` is 12.4% of arrivals with zero payload. Nothing produces
a rising rock mass that leaves the tray, removes an escape direction, and gives the tray a
believable place in a larger world — which is exactly the "context apron" that
`GOLDEN-SITE-WORLD-CONTEXT-PROJECTION` requires.

**Spec:** engine-owned edge condition, R1-08. No new table row is needed: it is a *rendering
of* the boundary column plus the biome, which is the cheapest possible fix.

### M4 — Wilderness has no base-relief roll. *(table)*

`Room Elevation Profile` (`room-elevation-profile`, d100, PROVISIONAL, Adam's ELEV-1 draft
2026-07-15) gives dungeon rooms a whole-room relief profile — Flat 40% · Dais 15% · Sunken
center 15% · Split-level 10% · Terraced 10% · Gallery ring 6% · **Chasm/shaft 4%** — with
min-dims gates and a documented walk-down rule (`degradedFrom`). **Wilderness has no
analogue.** So a wilderness tray is flat by default and elevation only ever arrives as an
isolated feature dropped onto a plane.

**Spec:** author `wilderness-elevation-profile` as a direct sibling, same 5-ft quanta, same
walk-down law, re-weighted for the open air and gated on the arrival's own footprint (which
already parses, and already ranges 16–256 cells). Proposed distribution, tuned so that
"mostly flat" stays the common case while the median 96-cell tray still gets relief roughly
half the time:

| roll | profile | shape | min dims |
|---|---|---|---|
| 01-30 | Flat | no change; every cell at tier 0 | — |
| 31-45 | Rise | a convex crown at +1..+2 somewhere off-centre (M1's hill) | ≥5×5 |
| 46-58 | Basin | −1..−2 depression; the relief-named shapes should weight toward this | ≥4×4 |
| 59-70 | Bench | +1..+2 across a contiguous 40–60% of the field; one ramp or stair cut joins | ≥4 cells on an axis |
| 71-80 | Terraced | 2–4 steps of +1 climbing from one edge | ≥5 cells on an axis |
| 81-88 | Cliff-split | the field is two datums 2h–8h apart sharing one polyline edge; named crossings only | ≥6 cells on the crossing axis |
| 89-95 | Incised | a crevice or gully 1–2 cells wide cut through the field | ≥5 cells on the cut axis |
| 96-100 | Chasm | a 2–4 cell gap removed entirely; 0–2 spans cross it | ≥6 cells on the crossing axis |

**Do not weight it by biome directly** — weight it by biome *and* by the already-rolled
boundary, so a `20-foot sheer cliff` boundary raises `Cliff-split`, and a `Deep, rushing
water` boundary raises `Basin`. That makes the two rolls agree instead of fighting, which
is the failure mode the guidelines' §2.5 projection pass exists to prevent.

### M5 — No tree, vegetation, canopy, or flora table exists anywhere. *(table)*

Confirmed hard negative. Vegetation appears only as row content inside other tables: 10 of
50 `wilderness-tactical-terrain` rows, 10 `wilderness-footing` rows, one `wilderness-area-type`
boundary string, two `wilderness-feature` rows. There is no roll for *how many trees, of what
kind, at what height.*

**Consequence, stated plainly: a Forest biome arrival can currently generate a battlemat with
zero trees on it.** Forest is the single most-rolled biome (14.3%).

**Spec:** see §3.4 — this is the tree doctrine's own table proposal. It is deliberately small
because Adam's canopy restraint means the table should roll *stand structure*, not species.

### M6 — No terrain table carries a spice band. *(table + compile)*

Every wilderness terrain table checked — area type, biome, tactical terrain, footing, hazard,
feature, lighting, set dressing, interactable — carries **zero** spice-band tokens. Terrain is
entirely outside the Spice Curve.

Two consequences, both binding on Adam's "diverse world" line:

1. Band-first rolling (`SPICE-RAISE`, region tier weights baseline 25/25/25/17/8 → rim
   0/5/25/45/25) **cannot grade terrain at all** — there is no band column to pick within.
2. `wilderness-tactical-terrain` is `table_class: Fork`, and `SPICE-CURVE` §4 caps Fork tables
   at Strange. **No Volatile or Mythic terrain can ever roll from it**, whatever we build.

**Spec:** add a Band column to `wilderness-tactical-terrain`, `wilderness-feature`, and
`wilderness-footing`, using `Region Identity`'s proven shape as the template — that table is
Commitment-ceilinged and declares `66 Grounded · 20 Textured · 9 Strange · 4 Volatile ·
1 Mythic`. For terrain, propose a **Fork ceiling on footing and tactical terrain**
(`70 / 20 / 10 / 0 / 0`) and a **Commitment ceiling on a new, separate table** for ground that
*breaks reality* — see §2.5 rung 4. Do not promote the existing Fork tables to Commitment; a
difficult-terrain row should not be able to roll a reality break, which is exactly what
`SPICE-CURVE` §4's "a smell table can't roll a reality-break" is protecting.

### M7 — Biome carries no mechanical payload. *(table)*

`wilderness-biome-type` is flavor-only; every mechanical table is "Biome Agnostic."

**Spec — and this is the highest-leverage single change in the missing list.** Do *not*
author ten biome-specific terrain tables; that is ten times the authoring for the same rows
with different nouns, and it is the "same house with worse furniture" failure the 42-roll
audit already caught. Instead add a **per-biome weight vector** over the existing
biome-agnostic rows — a small side table mapping each of the 10 biomes to a multiplier on
each of the d50's 50 rows and each of the d200 footing bands. Arctic weights `Steep Scree /
Icy Slope`, `Unstable Crust`, `Glaring Surface`, and `Tall Reeds / Deep Snow` up and
`Briar Patch`, `Thick Webbing`, `Clinging Kelp` to zero. Desert does the reverse. The rows
stay shared; only their probability moves. That is one authored artifact, it is mechanically
diverse immediately, and it preserves the dual-noun slashes (`tree/stalagmite`,
`earthen/snow`, `rock / ice`) that already let one row read across biomes.

### M8 — The Map Footprint column is not compiled. *(compile)*

`dev/verify-battlemap.mjs:381`, verbatim: *"no wilderness-tactical-terrain 'Map Footprint'
column exists in the compiled tables yet (BATCH2-GUARDRAILS G0/G9 + BATTLEMAP.md §3b: 'a
follow-up craft/tag unit, not a §4 blocker')."* The harness explicitly asserts the null-safe
placeholder. Fifty authored footprints and every `wilderness-feature` height are stranded in
markdown.

**Spec:** compile the column. This is the cheapest item on the entire list and it unblocks
every other one — no terrain geometry can be placed without it.

### M9 — Terrain draws only on combat, and only once. *(engine)*

See §1.2B. Enemy branch = 29.0% of legs; one draw where the table says 1d4.

**Spec:** move the `walkPick("wilderness-tactical-terrain", …)` call **out of
`wwalkEncounter` and up to the segment/arrival assembly**, so every wilderness arrival gets
terrain regardless of what encounter branch rolled, and draw `1d4` as authored. Grounds: the
governing law's own words — *"'Strategic' does not mean every site must become a combat
arena… Social, stealth, exploration, rescue, sabotage, defense, escape, and combat plans may
all qualify."* Terrain gated behind combat makes that sentence unbuildable. This also directly
serves marathon demand #1, which was overwhelmingly a *social-stealth* demand: every finding
in that cluster came from stakeout, tailing, and hiding turns, not fights.

### M10 — Dungeon terrain has no footprints at all. *(table)*

`tactical-terrain` (d10) is qualities only — `Open kill-zone`, `Scattered cover`, `Elevation`,
`Chokepoint`, `Fragile terrain` — with no dimensions and no RAW. `dungeon-walk.js:465` draws
it exactly as wilderness does.

**Spec:** the d50's rows are already labelled *Biome Agnostic* and the dual-noun slashes
already read indoors (`Thick-Trunked Tree / Stout Monolith`, `Copse / Rock Cluster`,
`Fallen Log / Toppled Pillar`, `Dense Canopy / Overhang`). **Promote the d50 to serve both
environments** and demote the d10 to a *composition hint* that biases which d50 rows are drawn
— `Chokepoint` weights rows 12/13/22 up, `Elevation` weights 11/14/41/46. One table, two
callers, no new authoring. This resolves the asymmetry without writing fifty dungeon rows.

### M11 — No timing terrain. *(table + engine)*

The governing law names **timing** as a tradeoff axis. Only three of fifty rows change over
time, and all three change on a *trigger*, not a clock: 28 `Unstable Crust` (two Medium
creatures), 44 `Crystalline Outcropping` (bludgeoning/thunder), 48 `Porous Pumice`
(thunder/bludgeoning). No tide, no rising water, no burning fuse, no collapsing span on a
count. Marathon demand #4 — water/flood as *recurring dramatic architecture* across four
separate sets — has no home anywhere in the corpus.

**Spec:** one new mechanic, not a table — a **terrain clock**: a declared property on a
terrain piece of the form `{ trigger: round|damage|weight|external, threshold: n, transform:
<piece-parameter-delta> }`. The rising-water case is a single parameter (`waterDatumH`) moving
one step per n rounds, and because the shoreline is *derived* from where terrain crosses the
water plane (§2.3, R1-06), the entire flooded footprint recomputes for free. This is also the
honest mechanism for the flooding transform that `SETTLED-LIFE-SITES-PROGRAM` §4.2 already
routed to the `TransformStack`.

### M12 — Two ground systems that do not talk. *(engine)*

`REALM-SURFACES-WIRING` §3's `theaterFloorMaterial(segment, biome, env, opts)` picks a floor
from `REALM_SURFACES` by keyword-matching segment text, then falls back to a seeded-random
pick. It **never reads `wilderness-footing`**. So the d200's rolled surface — with its
movement cost, its tracking DC, and its coverage geometry — and the realm's *named*
surface are two independent answers to "what is the ground here," and only the second one is
rendered.

**Spec:** make the footing roll the *authority* and the realm surface the *skin*. Footing
returns `{material, coverage, movementImpact, trackingDC}`; the realm layer maps
`material → REALM_SURFACES` entry for the active realm and returns the tint, the name, and
the prose-twin string. Preserves the blind-playable law (`surfaceName` still rides into the
prose twin) and the regression law (no realms → today's behavior). One roll, two
consumers.

### Missing-list ownership summary

| lane | items |
|---|---|
| **compile** (cheapest, unblocks everything) | M8 |
| **engine wiring** | M9, M12, M3 |
| **table authoring** | M1, M2, M4, M5, M6, M7, M10 |
| **new mechanic** | M11 |

---

# 2. THE GENERIC-FIRST LADDER

## 2.0 The chassis and the one geometric law

Everything in rung 1 sits on **one** chassis. It is not thirteen generators; it is one
heightfield plus thirteen ways of shaping and cutting it.

**R1-00 — the terrain field.** *Real-world construction first:* this is graded ground. A
surveyor sets a datum, then every point on the site is a whole number of steps above or
below it — that is how a site plan is actually drawn, and it is why cut-and-fill balances.

Genesis already owns the quanta (`STRUCTURE-KIT-CATALOG` §2, ruled 2026-07-24, redline R1
LOCKED):

| law | value | source |
|---|---|---|
| horizontal cell | **5 ft** | the combat grid cell; one floor tile = one cell |
| vertical quantum | **h = 2.5 ft** | every standable surface sits at n×h |
| storey | **4h = 10 ft** | |
| walkable slope | **≤30°** | audited limit from the uneven-ground proof; steeper is *guarded slope* — visible, never standable |
| stair unit | 5×5 ft footprint, bridges near-flat through 5 ft | two max-rise units bridge one storey |
| parapet | 2h | |
| climb DC bands | 12 / 15 / 17 + condition modifier, one check per storey climbed | R3 |

> **THE ONE RULE THAT MAKES TERRAIN WORK: a rise of ≤1h across one 5-ft cell is walkable
> (atan 2.5/5 = 26.57°, inside the 30° limit and identical to the ramp CL-R3 already
> builds). A rise of >1h across one cell is a face — guarded, climbable, never walked.**
>
> Every hill in this program is a field where no neighbouring cells differ by more than 1h.
> Every cliff is a field where two adjacent cells differ by 2h or more. **Hills and cliffs
> are the same generator with one clamp changed.** That is why this is one chassis.

**Chassis morph parameters** (shared by every piece; each piece adds its own on top):

`extentCells {x,y}` · `baseDatumH` · `cellHeightsH[]` (integer n×h per cell) ·
`slopeClamp` (1h default = walkable; ∞ = faces permitted) · `noiseAmplitudeH` +
`noiseScale` (sub-quantum surface break-up, never enough to change a cell's tier) ·
`materialRouting` (per-cell base material from `wilderness-footing`, tinted per realm —
see M12) · `seed`.

**Chassis rejection rules** (countable, per the guidelines' §8.10 requirement):
a cell whose height differs from an orthogonal neighbour by 2h+ **must** own a face piece ·
no standable surface may be unreachable by a non-flying route (the tone law made countable,
`STRUCTURE-KIT` §6) · every arrival's named entries (94.3% of area-type rows have one) must
resolve to a walkable cell at the tray edge · a piece that would occupy more than 60% of the
tray's cells walks down to its next-smaller variant and records `degradedFrom`, borrowing
`room-elevation-profile`'s own proven law.

## 2.1 Rung 1 — the thirteen must-haves

Seven are Adam's named list. Five are added because the rolls demand them and a battlemat
without them is flat. One is the climbable-organic system Adam asked for, specced in §3.5 and
listed here for completeness.

| # | piece | Adam named it? | why it is rung 1 |
|---|---|---|---|
| R1-01 | Cliff | ✅ | 16.67% of arrivals are walled by one; `wilderness-feature` 145 rolls it at 40′×30′ |
| R1-02 | Hill | ✅ | biome Hill is 11.1% of arrivals and no hill exists (M1) |
| R1-03 | Crevice | ✅ | d50 row 13; census `Narrow Fissure` + `Bottomless Crevasse` |
| R1-04 | Chasm | ✅ | `wilderness-feature` 144 (30′ drop); `room-elevation-profile` 97-100 |
| R1-05 | Pond | ✅ | `wilderness-feature` 157/236; d50 row 25 |
| R1-06 | Puddle | ✅ | does not roll (M2); serves marathon demand #1 at zero movement cost |
| R1-07 | Mountainside | ✅ | does not roll (M3); the tray's honest edge and context apron |
| R1-08 | Berm / trench | — | d50 rows 1 **and** 5; census `Earthwork Trench` ×4 — the cheapest cover in the kit |
| R1-09 | Terrace bench | — | d50 row 14; census `Terraced Slopes` ×5 (tied highest landform); `Stepped Sinkhole` ×2 |
| R1-10 | Scree fan | — | d50 row 15 + footing row 149 — **the unstable-ground demand, marathon #2** |
| R1-11 | Boulder cluster | — | d50 rows 2/3/12; census Lone+Balanced+Split+Hollow Rock = 16 inst. |
| R1-12 | Bank | — | 16.67% of arrivals are walled by a 10-ft earthen/snow bank |
| R1-13 | Root/branch bridge network | ✅ (implicitly) | Adam's explicit answer to the tree problem — specced in §3.5 |

Below, each piece: **real-world construction first** (the standing 3D ruling — restate how
the thing is actually built before claiming any geometry), then its **tactical role** (the
governing law — what decision it creates), then its **morph parameters** (Adam's procedural
requirement — every piece must resize, stretch, and deform by named parameter).

---

### R1-01 · CLIFF

**Real-world construction.** A cliff is not a steep hill. It is two pieces of ground at
different datums meeting at an edge where the material is competent enough to stand
vertically — a bedding plane in sedimentary rock, a fault scarp, a quarry face, a river
undercut. The face has a *top*, a *foot*, and usually a *talus* of its own debris at the
bottom. Water gets in at the joints and takes chunks out, which is why real faces have
ledges, notches, and one or two places soft enough to climb. Genesis already builds this
exact object indoors: `CL-R3` ships a riser/retaining run with honest thickness, inner and
outer faces, cap, inside/outside corners, and an endpoint. **A cliff is that piece, outdoors,
tall.**

**Tactical role.** The hardest thing terrain does. Total cover at the foot; three-quarters
cover from the top down; an absolute sightline break; and — the point — it converts the tray
from an open field into a place with a *back*. Two viable approaches by construction: take
the named crossing (fast, a chokepoint anyone can hold) or climb (slow, a check, a fall
beneath, and you arrive one at a time). `wilderness-feature` 145 already prices the climb at
DC 15 Athletics.

**Morph parameters.**
`riseH` (2h minimum = 5 ft, to 12h = 30 ft; `wilderness-feature` 145 rolls 30′, the
area-type boundary rolls 20′) · `edgePolyline` (the plan path — straight, convex, concave,
re-entrant) · `runLengthCells` · `faceBatter` (0° vertical → 15° leaning back; a battered
face is climbable at one DC band lower) · `topOverhang` (0–1 cells; census `Overhanging
Cliff` ×3 and `Overhanging Wall` ×2 both roll it) · `ledgeSet[]` (each `{atH, widthCells,
runCells}` — this is where d50 row 11 `Sniper's Perch` and row 39 `Slippery Ledge` live, and
area-type names a ledge in 8.3% of rows) · `notchSet[]` (climbable weaknesses; each carries
its own DC band) · `talusApron` (0–3 cells of R1-10 scree at the foot) · `jointSpacing` +
`beddingThickness` (the material's fracture grain — pure silhouette, no gameplay).

**Composes with:** R1-09 terrace (a cliff cut back in benches is a quarry) · R1-10 scree
(the foot) · R1-04 chasm (two cliffs facing each other) · R1-13 roots (a root mass on the
lip, arching down the face, is the free climb).

---

### R1-02 · HILL

**Real-world construction.** A hill is a pile of material at or below its angle of repose —
loose soil sits at about 33°, wet soil less, so anything you can walk on is a hill and
anything you cannot is a face. It has a *crown* (usually a flat or near-flat cap, because
the top erodes fastest), *flanks* of differing steepness (the windward and lee sides are
never the same), and a *foot* that blends into the ground rather than meeting it at a line.
Construction in the chassis is one clamp: a radial height falloff where **no two
neighbouring cells differ by more than 1h**, which forces every flank under 26.57°.

**Tactical role.** The elevation *gradient* — the piece that makes high ground a thing you
spend movement to earn rather than a binary you are on or off. Melee from higher elevation
grants advantage (`BATTLEMAP` §1, the terraced-steps rule generalized). Sightline over low
cover from the crown. And the two-approach promise is built into the asymmetry: the shallow
flank is long, safe, and slow; the steep flank is short, at the walkable limit, and exposed
the whole way.

**Morph parameters.**
`crestHeightH` (2h–8h) · `footprintRadiusCells` · `asymmetry` (0–1; pushes the crest off
centre, which is what makes one flank steep and the other long) · `crownFlatCells` (0 = a
peak you cannot stand on comfortably, 4+ = a usable platform) · `flankProfile`
(`convex` | `concave` | `sigmoid` — a concave flank hides its own foot from its own crown,
which is a real sightline lever) · `flankNoiseH` (sub-quantum) · `spurCount` (0–3 ridges
running off the crown; each spur is a covered approach) · `saddleTo` (optional link to a
second hill, creating the pass between them).

**The one guard:** if any requested `crestHeightH / footprintRadiusCells` ratio would need a
>1h step, the piece must either widen its footprint or **convert that flank to an R1-01
cliff and say so in the receipt.** It must never silently produce a 45° walkable slope. That
is a countable rejection rule, and it is the single most likely place this system lies.

---

### R1-03 · CREVICE

**Real-world construction.** A joint in bedrock widened by frost and water — a slot with two
near-parallel walls and a floor, usually choked with fallen debris and often narrowing or
closing overhead where the walls lean together. It is a passage, not a hole: you walk *into*
a crevice. d50 row 13 prices it exactly — `5' wide, 15' long`, Medium creatures Squeeze.

**Tactical role.** The only rung-1 piece that gives **cover from above** and the only one
that gives a ceiling. It is a bottleneck with a roof: forced single-file, sightline broken
at every dog-leg, and — critically — the roof bridges are a *route over* the people inside
it. Two plans, both real: go through (fast, committed, no retreat, Squeeze penalties) or go
over (slow, exposed to anything higher, but you arrive on top of them).

**Morph parameters.**
`widthCells` (1 = Squeeze for Medium per row 13; 2 = single file; 3 = normal move) ·
`lengthCells` · `wallHeightH` · `pathSinuosity` (0 = straight and therefore a shooting
gallery; ≥1 dog-leg is what converts it from difficult terrain into a sightline break —
d50 row 16 `Blind Corner` is exactly this parameter at value 1) · `floorProfile`
(`level` | `stepped` | `rising` | `debris-choked`) · `roofBridgeCells[]` (0–n cells where
the walls meet overhead — each is total cover below and a 1-cell walkway above) ·
`wallConvergence` (parallel → V-section; a V-section crevice is impassable at the bottom
and walkable at the top, which inverts who owns it) · `openings[]` (side entries at the
tray edge).

---

### R1-04 · CHASM

**Real-world construction.** The ground stops and resumes. A fault gap, a collapsed cave
roof, a river that cut faster than the rock could weather back. Both rims are cliff faces
(R1-01) pointed at each other; the floor is either visible far below or lost in dark. Rims
undercut over time, which is why the edge you are standing on is rarely the edge you can see.
Where the roof of the cave did not fully collapse, a natural land bridge survives — which is
exactly what `wilderness-feature` 144 rolls: `5' wide bridge, 30' drop`.

**Tactical role.** **The route-forcing piece, and the home of the play two marathon players
invented unaided.** It does not slow you down; it says no. Every plan on a chasm tray is
about the crossings — hold one, break one, race for one, or take the long way. The crumbling
rim is the bait-them-onto-the-edge lever, and it is the reason this piece is rung 1 rather
than rung 2.

**Morph parameters.**
`widthCells` (**2 = 10 ft = jumpable on a running long jump for most PCs; 3+ = not** — this
single parameter is the entire tactical dial) · `lengthCells` · `pathPolyline` ·
`depthH` (or `bottomless: true`, which renders a dark floor and treats a fall as the
scene-risk contract's own severe case) · `rimCondition` (`clean` | `crumbling` |
`undercut` — crumbling declares a countable collapse trigger per §2.4) · `spanSet[]`
(each `{kind, atCell, widthCells, integrity}`, kind ∈ `stone-arch` | `fallen-trunk` |
`rope-bridge` | `stepping-pillars` | `ice-shelf`) · `rimLedges[]` (a path *along* the inside
of the rim — the sneaky route, and the reason `Slippery Ledge` exists as a row).

**Engine owns the hole.** `MESHY-WILDERNESS-SETPIECE-QUEUE` §5.1 already assigns
`engineOwns` = *"exact terrain hole, elevation authority, walkability, collision
resolution."* This piece is the reason that clause exists.

---

### R1-05 · POND

**Real-world construction.** A depression that intersects the water table. The water surface
is a **horizontal plane at a fixed datum** — it does not follow the ground, the ground
follows it. The shoreline is therefore not a thing anyone draws: it is simply wherever the
terrain crosses the plane. Banks are gentle where the pond deposits silt and undercut where
it does not. Reeds grow in the shallow margin because that is where light reaches the bed.

**This derivation is the whole design.** Because the shore is computed, raising the water
datum by one step floods the pond outward *for free*, correctly, following the real ground.
That is M11's timing mechanic, the settled-life flooding transform, and marathon demand #4,
all from one parameter.

**Tactical role.** Not a wall — a **movement-cost gradient**, which is a rarer and more
interesting thing. Ranged attackers are unaffected; melee is punished; heavy armour is
punished more. Depth ladder straight from the RAW the tables already carry:

| depth | effect | source |
|---|---|---|
| ≤1h (≤2.5 ft) | difficult terrain, wading | footing 087/096 |
| 2h (5 ft) | Medium swims, Small submerged | d50 row 25 |
| ≥4h (10 ft) | swimming; melee underwater at disadvantage except dagger/spear/trident | d50 row 25, row 42 |

**Morph parameters.**
`basinRadiusCells` · `maxDepthH` · **`waterDatumH`** (the live one — the flood dial) ·
`shoreProfile` (`gentle-wade` | `undercut-bank` | `stepped-shelf`) · `clarity`
(`see-bottom` → the bed is readable and so are things dropped in it; `opaque` → total
concealment below the surface, which is d50 row 25's own word) · `marginVegetationCells`
(reeds — footing row 083's `Waist-High Grass / Thick Reeds`, difficult terrain, obscures
small creatures) · `outflowCell` (optional; connects to a stream and makes the pond part of
a network rather than an island).

---

### R1-06 · PUDDLE

**Real-world construction.** Rainwater lying on ground it cannot soak into — hardpan, clay,
rock, ice-melt on frozen soil. It is a *film*, an inch or two, held in cell-scale
depressions. No excavation, no geometry: the ground dips one sub-quantum step and water
sits in it. It dries from the edges inward, so an old puddle is a ring of dark ground around
a shrinking bright centre.

**Tactical role — and this is a design call I am making.** *A puddle is an information
system, not a hazard.* It costs no movement and blocks nothing. What it does:

1. **Reflects.** A creature can read what is around a corner off the surface. This is the
   cheapest possible answer to marathon demand #1 — sightline geometry for stakeout — and it
   costs the player no position.
2. **Records.** It holds tracks. Marathon demand #5 was "small provable objects that answer
   investigation probes"; a puddle is one that generates itself.
3. **Announces.** Crossing at speed is audible. A stealth approach must route around it,
   which turns a flat, featureless quadrant into a decision.
4. **Conducts.** Lightning through standing water is the one hazard case, and it should stay
   the exception rather than the identity.

**Grounds for the call:** the corpus already has thirty hazard-band footing rows and twelve
hazardous d50 rows. It has almost nothing that rewards *looking*. Making puddles a fourth
hazard would add nothing; making them the game's cheapest information surface fills a real
hole, and it is the piece that lets a stealth-first player use terrain at all.

**Morph parameters.**
`patchSet[]` (`1d4 10x10 patches` is footing's own coverage grammar — reuse it verbatim) ·
`depthInches` (1–6; above 6 it is a pond) · `spread` (`sheet` | `scattered` | `ring`) ·
`reflectivity` (0–1; drives the see-around-corners DC and is killed by rain or disturbance) ·
`disturbance` (`still` | `rippling` | `churned` — churned is the tell that something already
crossed) · `substrate` (`hardpan` | `clay` | `rock` | `ice-melt`; clay keeps tracks longest).

---

### R1-07 · MOUNTAINSIDE

**Real-world construction.** Not a mountain — a *side*. Almost every real mountain scene a
person actually stands in is a **bench**: a shelf of workable ground with the slope rising
out of sight above it and falling away below. The bench exists because something cut it — a
stream, a road crew, a landslide that stopped. Below the rising face there is always a
**talus apron**, the fan of everything that has fallen off it. Gullies incise the face at
intervals, and those gullies are the only ways up.

**Tactical role.** It **removes a direction.** One or two tray edges stop being escape
routes and start being walls, which compresses every plan into the remaining space and makes
the tray feel like a real location rather than a floating island. It is also the honest
answer to the guidelines' §2.5 context-apron requirement: the near/mid/far context is *this
piece*, derived from the biome and boundary the walk already rolled, rather than painted in.

**Decision: mountainside is an edge condition, not an object — engine-owned, never Meshy.**
Grounds: `MESHY-WILDERNESS-SETPIECE-QUEUE` §3 already routed `Towering Mesa` ×5 and
`Terraced Slopes` ×5 to the engine for exactly this reason — *"buying a mesa as a mesh would
put a fixed-size object where the engine needs authored height."* A mountainside must resize
with the tray; a mesh cannot.

**Morph parameters.**
`edgesOccupied` (which of the 4 tray edges — 1 = a wall, 2 adjacent = a corner pocket,
2 opposite = a valley floor, 3 = a cul-de-sac and probably a rejection) ·
`benchWidthCells` (how much flat ground the player actually gets — the tension parameter) ·
`riseRate` (h per cell beyond the bench; >1h by definition, this is guarded slope) ·
`talusApronCells` (0–4 cells of R1-10 scree at the foot, walkable difficult terrain) ·
`gullySet[]` (0–2 incisions, each a genuine route out at a stated climb DC — **at least one
must exist unless the scene explicitly wants a dead end**, per the non-flying-route rule) ·
`snowlineH` / `treelineH` (material bands, pure silhouette) · `hazeGradient` (atmospheric
depth — the far context).

---

### R1-08 · BERM / TRENCH

**Real-world construction.** These are **one operation.** You dig a ditch and the spoil goes
beside it; the bank *is* the hole's material. Every field boundary, every earthwork, every
defensive line in history is this. Which is why d50 row 1 (`Earthen Berm / Low Ridge`,
5′ wide, 20′ long) and row 5 (`Natural Trench / Dry Creek`, 10′ wide, 30′ long) are the same
piece with a sign flip — and why census `Earthwork Trench` rolls 4 times and reads as both.

**Decision: berm and trench are one parametric piece.** Grounds: real-world construction,
plus it halves the geometry and doubles the coverage.

**Tactical role.** The cheapest cover in the kit and the only one that reads instantly at
the fixed production camera from any angle. Row 1's own RAW: **half cover standing, total
cover prone.** The gaps in it are the routes, and where a berm has a paired ditch, crossing
costs 5 extra feet each way — so a berm line is a real decision about whether to commit.

**Morph parameters.**
`pathPolyline` · `heightH` (1h or 2h; 2h stops being cover and starts being a wall) ·
`crestWidthCells` (1 = you cannot stand on it; 2+ = you can, and then it is low high-ground) ·
`pairedDitch` (bool — the sign flip) · `ditchDepthH` · `ditchWidthCells` ·
`gapSet[]` (breaks; each is a route and a chokepoint) · `revetment` (`none` | `timber` |
`stone` | `sod` — cultural skin, and the one place a realm reads on this piece) ·
`erosion` (0–1; a slumped berm loses its total-cover-prone property, which should be
*visible*, not a hidden stat).

---

### R1-09 · TERRACE BENCH

**Real-world construction.** A slope converted into a staircase of flats, each held by a
retaining face. Agricultural terracing, quarry benches, hillfort ramparts — all the same
solution to the same problem, which is that you cannot farm, quarry, or fight on a slope.
The face is short (1h–2h, because that is what you can build without engineering) and the
tread is wide. Faces fail eventually, and where one fails it becomes a ramp of its own
material — which is the route. `STRUCTURE-KIT` already ships the retaining face at 1h/2h.

**Tactical role.** The elevation ladder, one advantage step at a time. d50 row 14 prices it
exactly: 5 extra feet to climb a step, **advantage on melee attacks against targets on lower
steps**. That per-step grant is what makes a terrace a genuinely different fight from a hill
— on a hill you are up or down; on a terrace, every single step is a decision about whether
gaining one tier is worth the movement.

**Decision: terrace is rung 1, not a style variant.** Grounds: `Terraced Slopes` is tied for
the highest-count landform in the census (5 instances), row 14 is live in the d50, it is the
only piece that produces *graded* elevation, and it composes into three other things for free
(against a cliff = a quarry; around a hill = a fort; around a pond = a bathing tank).

**Morph parameters.**
`stepCount` (2–6) · `riseHPerStep` (1h or 2h) · `treadDepthCells` (1 = a stair, 3+ = a real
fighting platform) · `planCurve` (`straight` | `concentric` | `spiral` | `following-contour`)
· `faceMaterial` (dry stone / cut stone / timber crib / turf — the strongest cultural signal
in rung 1) · `breachSet[]` (collapsed faces that became ramps — the routes, and the piece's
degradation path) · `drainageChannels` (0–n; cosmetic until it rains, then they are the
water's path).

---

### R1-10 · SCREE FAN

**Real-world construction.** The pile of broken rock at the foot of a face, sorted by size —
fines near the top of the fan, the big blocks that bounced furthest at the bottom. It sits
at its angle of repose, which for angular rock is around 35–38°, so a *stable* scree fan is
right at the edge of walkable and a *live* one is not walkable at all. It moves when you
step on it. That is the entire point.

**Tactical role. This is the unstable-ground piece — marathon demand #2, the one two
players invented independently.** d50 row 15's RAW: difficult terrain, and if you Dash,
DC 12 Acrobatics or fall prone. Footing row 149 adds: on a fail you also *end your movement*.
So scree is the terrain that punishes speed specifically — you can cross it, but not
quickly, and the moment someone is in a hurry the ground takes a vote. It is also the
natural foot of R1-01 and R1-07, so it arrives free with the two biggest pieces.

**Morph parameters.**
`fanRadiusCells` · `riseH` · `apexCell` (where it spills from) · `grainSize`
(`dust` → `gravel` → `cobble` → `block-field`; **this parameter changes the RAW**: dust and
gravel are row 15's Dash check, cobble is difficult terrain, block field becomes d50 row 23
`Shattered Debris` — half cover to anyone who drops prone in it) · `stability`
(`settled` | `live`; live declares a countable slide trigger per §2.4) · `sortingGradient`
(0–1, how strongly grain size varies down the fan — pure silhouette, but it is what makes a
scree fan look like a scree fan rather than a grey triangle).

---

### R1-11 · BOULDER CLUSTER

**Real-world construction.** Blocks that fell off something and stopped where they stopped.
They are *embedded* — a boulder that has sat for a century is buried to a third of its
height with soil piled on the uphill side. They are never evenly spaced, because they came
off a face in events, not continuously. The gaps between them are as much a part of the
formation as the rocks.

**Decision: the cluster is procedural; the individual rock body may be Meshy.** Grounds: the
*tactical content is the arrangement* — d50 row 12 `Choke Point` is literally *"two massive
obstacles leaving a narrow gap"*, which is a spacing parameter, not a mesh. The rock's
silhouette is art. `MESHY-WILDERNESS-SETPIECE-QUEUE` §4.1 already assigns the bodies to
existing families **M001** (low cover boulder cluster) and **M002** (tall cover outcrop) and
explicitly says *"extend, do not re-buy."*

**Tactical role.** The cover vocabulary, at three heights that do three different things:
below waist = half cover, prone-only concealment; chest = half cover standing (d50 row 2's
neighbour); above head = three-quarters cover **and a line-of-sight block** (row 2's own
words). A cluster of mixed heights is a legible, readable cover field. A paired-gate
arrangement is a chokepoint.

**Morph parameters (procedural half).**
`count` · `arrangement` (`scattered` | `ring` | `paired-gate` | `stacked` | `linear-fall`) ·
`spacingCells` + `spacingJitter` · `gapWidthCells` (the chokepoint dial) ·
`heightRangeH` (drives the cover class per rock) · `embedDepth` (0–0.4 of height; this is
what makes them look placed by geology rather than dropped by a level designer) ·
`uphillSoilBank` (bool) · `donorFamily` (M001 / M002 / null → procedural proxy).

---

### R1-12 · BANK

**Real-world construction.** A steep earthen or snow face, 10 ft or so — too steep to walk,
too short and too soft to be a cliff. A river cut bank, a road cutting, a snowdrift lee, a
terrace face that nobody built. It has no bedding planes; it slumps rather than fracturing,
and it grows vegetation on the top lip that hangs over.

**Why it is a separate piece from R1-01 and not a short cliff:** 16.67% of every wilderness
arrival is walled by `Steep 10-foot earthen/snow banks` — that is ~90 of 539, the same
frequency as the cliff. And **10 ft is exactly 4h, one storey**, which means a bank is
climbable in one check where a 20-ft cliff is two, and it is the exact rise a single R1-09
terrace face plus a stair unit can defeat. Different material, different climb math,
different silhouette, same demand size. Merging it into the cliff would lose the most common
*surmountable* vertical in the game.

**Tactical role.** The surmountable wall. It says "not this way, quickly" rather than "not
this way." Every bank has at least one place where it has slumped into a scramble, and
finding that place is a real exploration beat.

**Morph parameters.**
`heightH` (2h–4h; above 4h it must become R1-01) · `edgePolyline` · `faceAngle`
(35°–75°; below 35° it is a hill flank, above 75° it is a cliff and must say so) ·
`slumpSet[]` (scrambles — walkable at difficult-terrain cost, the routes) ·
`lipOverhang` (turf or snow cornice hanging over the edge — **and a cornice is a countable
collapse trigger**, which is the single best bait-the-enemy-onto-the-edge object in rung 1)
· `undercut` (bool; a river cut bank is undercut and the lip will not hold weight) ·
`vegetationLip` (0–1).

---

## 2.2 What rung 1 must be able to build before rung 2 opens

Rung 1 is not complete when thirteen pieces exist. It is complete when the chassis can
reproduce **every terrain fact the tables already roll**, measured:

| gate | measure |
|---|---|
| every area-type boundary builds | all 6 boundary strings resolve to a built piece (cliff ×1, bank ×1, pond/mud edge ×1, thicket volume ×1, trunk field ×1, fog volume ×1) — 100%, not 5 of 6 |
| every `wilderness-tactical-terrain` row places | all 50 rows resolve to a piece + parameter set, or are explicitly declared non-terrain with a reason |
| every dimensioned `wilderness-feature` terrain row builds at its rolled size | the ten rows quoted in §1.2C, at 40′×30′, 30′ drop, 30′ dia × 15′ deep, etc. |
| every footing coverage geometry places | all 13 coverage strings (`100% of Area` … `Outer Perimeter`) |
| the named entries resolve | 94.3% of area-type rows name an entry; 100% of those must land on a walkable edge cell |
| slope law holds | zero walkable cells at >30°; zero standable surfaces unreachable without flight |
| the tray's own dims are honored | 16-cell and 256-cell trays both build legally; the 60-cell-and-under cases prove the walk-down |

**No style variant is authorized until this table is green.** That is the generic-first
ladder made countable, and it is the same discipline `CLAYROOM-RESET-LADDER` applies to
construction atoms.

## 2.3 Rung 2 — realm skins (Grounded / Textured)

**Same thirteen pieces. Same parameters. Materials and sub-quantum silhouette detail only.
No new geometry parameter may be introduced at this rung.**

The routing already exists and needs only M12's fix: `wilderness-footing` supplies the
material class and the mechanical impact; `REALM_SURFACES` supplies the tint, the name, and
the prose twin, per realm. The 12 base materials the draft already names cover terrain
almost completely — `mud` · `cracked-earth` · `sand` · `cave-rock` · `scree` · `ash` ·
`leaf-litter` · `snow-ice` · `grass` — plus the built three (`plank` · `flagstone` ·
`cobble`) for revetments and terrace faces.

Eleven realms × thirteen pieces = 143 skin combinations from **zero new geometry**. Worked
examples, using surface names already authored in `REALM-SURFACES-DRAFT`:

| piece | `lost-world` | `ash` | `high-seas` | `bright-kingdom` |
|---|---|---|---|---|
| R1-01 cliff | `Moss-Stone Terrace` face, buried colonnade in the bedding | `Bunker Slab` — poured concrete strata, rebar in the fracture | `Tide-Pool Shelf` — a sea cliff with a wet zone at the foot | `Candy-Shell Cobble` |
| R1-09 terrace | temple steps that were terraces | rubble-crib retaining, salvaged | harbour steps with a tide mark on every face | layered icing benches |
| R1-10 scree | `Root-Cracked Earth` + potsherd | `Cinderfield` | shell and shingle | `Marzipan Scree` |
| R1-05 pond | a flooded cistern with a rim you can walk | `Mudflat Sink` | a tidal pool that empties | a syrup pool |

**The band law for rung 2 — a ruling I am making, with grounds:**

> **A terrain piece never changes its spice band by changing its material.**
> A glass tree is not Strange because it is glass. It is Strange because *a tree became
> glass* — the transformation is the rolled fact, not the substance. So every rung-2 realm
> skin **inherits the band its host row rolled** and may never raise it.

Grounds: without this rule, `chrome` and `cosmic` would make every rock in the world Strange
for free, which breaks `SPICE-CURVE` §2's whole premise that *"a spicy result is simply a
rare roll, honestly weighted."* A cosmic realm's ground being `Wrong-Angle Flags` is that
realm's *ordinary*; a Strange result there has to be stranger than the realm's baseline or
the ladder means nothing. This also protects the player-tone-agency clause — a realm choice
must not silently escalate the world's weirdness.

## 2.4 Rung 3 — honest-Strange terrain (Strange band, rare)

Geometry that is still real construction but reads uncanny, because something happened to it.
**These roll rarely and really** — under M6's proposed `70 / 20 / 10 / 0 / 0` Fork ceiling,
Strange is 10% of terrain rolls at baseline tier, rising with region fray per `SPICE-RAISE`.

Every rung-3 piece is **a rung-1 piece plus one transformation**, never new geometry:

| rung-3 result | rung-1 host | the transformation | already rolls |
|---|---|---|---|
| Petrified waterfall | R1-01 cliff | the water froze as stone; the face is now a climbable ramp at DC 10 | `wilderness-feature` 171, `20' wide, 40' high` · census ×3 |
| Basalt columns | R1-01 / R1-09 | the rock fractured hexagonally; the terrace steps are columns | census ×3 |
| Glass desert | R1-00 field | the ground fused; `sand` → glass, reflective, hazardous | census ×2 |
| Stepped sinkhole | R1-04 chasm | the collapse happened in stages, leaving 5′ tiers | `wilderness-feature` 143, `30' diameter, 15' deep` |
| Floating rock steps | R1-04 + anomaly | the span is there but nothing holds it | census ×4 |
| Petrified root system | R1-13 | the roots mineralized; grip is now glass-slick | census ×1 |
| Mirror of the sky | R1-05 pond | perfect stillness, perfect reflection, no wind ever | census ×2 |
| Petrified geyser | R1-05 | the column froze mid-eruption; total cover, DC 15 to climb | `wilderness-feature` 299 |

**The rung-3 authoring law:** if a proposed Strange terrain requires a geometry parameter
that rung 1 does not have, it is **not** rung 3 — it is a missing rung-1 parameter, and it
goes back. This keeps the strange world standing on ordinary ground, which is what makes it
strange.

## 2.5 Rung 4 — terrain that acts (Volatile / Mythic)

**Blocked, and honestly so.** `wilderness-tactical-terrain` is `table_class: Fork`, and
`SPICE-CURVE` §4 caps Fork tables at Strange. **No Volatile or Mythic terrain can roll from
the existing table no matter what we build.**

Rung 4 therefore requires a *separate, Commitment-class* table — ground that changes the
world, written to the World State Ledger and persistent thereafter per `SPICE-CURVE` §2.
Candidates already rolling as anomalies in the census: `Anti-Gravity Zone` ×2 ·
`Wild Magic Zone` ×2 · `Time-Locked Debris` ×1 · `Silent Zone` ×3 · `Shadow-Weave Patch` ×3
· d50 row 47 `Vortex / Maelstrom` · row 46 `Floating Earth Mote` · row 29 `Dead Zone`.

**Ruling: rung-4 terrain is a behaviour layer over rung-1 geometry, never new geometry.**
Grounds: `MESHY-WILDERNESS-SETPIECE-QUEUE` §3 already reached the same conclusion from the
purchasing side — *"in every one of these, the object is trivial and the behaviour is the
entire content"* — and the queue's `engineOwns` clause already says *"every row in this queue
that came from a rolled anomaly keeps its behaviour on the engine side."* An anti-gravity
zone is a stone slab with an inverted gravity vector, not a new kind of slab.

**Rung 4 is not authorized and should not be built until rungs 1–3 are proved.** It is
recorded here so the ladder is honest about where it ends, and because M6's table work should
not have to be redone when it arrives.

---

# 3. THE TREE DOCTRINE

## 3.1 The problem, stated exactly

Adam: *"we might need several tree models from meshy, ideally we don't want too many trees
that interfere with tactical play, so giant roots or branches you can climb on are encouraged
(those could be made in engine)."*

The tension is real and it is a camera problem. Genesis uses a **fixed production camera**
(governed zoom/pan/focus, no orbit — the common clay-proof contract, item 2). A tree crown is
a large opaque mass at exactly the height that sits between that camera and the board. Walls
have the same problem and Genesis already solved it: `CL-R3a` **omits camera-side wall uppers
at compile time** rather than fading them, and the receipt proves it selects exactly the
camera-side segments. **That solution does not transfer.** You can omit half a wall and the
room still reads as a room. Omit half a canopy and it reads as damage.

## 3.2 The doctrine, in one sentence

> **Meshy buys trunks, stumps, and root masses — few, silhouette-strong, canopy-suppressed.
> The engine builds the roots, branches, and fallen trunks as a procedural climbable bridge
> network. Because a canopy is scenery the camera must see past, and a root is terrain the
> player stands on.**

## 3.3 Canopy restraint, made concrete

**Ruling: no canopy geometry enters the tactical tray. Ever.**

Canopy becomes three things, none of them a mesh:

1. **A mechanical volume**, which the table already models. d50 row 4, verbatim:
   `**Dense Canopy / Overhang:** Thick branches or a stone ceiling. | 20'x20' overhead |
   **Tactical Ceiling.** Blocks aerial attacks. Flying creatures cannot ascend more than 10
   feet here.` That is a rule with a footprint and no geometry — it already works.
2. **A light gobo.** Dappled light through leaves is the single most recognizable "we are in
   a forest" signal, and it is a light-recipe parameter, not a mesh. It also satisfies the
   motivated-light law: the emitter is the sky, the occluder is declared, the pattern is
   derived.
3. **An overhead shadow decal**, aligned to the volume, so the ceiling is *readable* on the
   board rather than merely true.

Grounds, four ways: the cutaway law cannot rescue a crown · the table already treats canopy
as a rule · the fixed camera makes crowns pure occlusion cost · and Adam's own instruction
prefers climbable roots to crowns.

**The honest risk, flagged not hidden:** a forest of bare boles may read as a *burned* forest
rather than a wood. That is a visual verdict and it is Adam's — see founder question 4.

## 3.4 The tree table that does not exist

M5 is a hard negative: there is no tree, vegetation, canopy, or flora table in the Engine. A
Forest arrival — the most-rolled biome at 14.3% — can generate a treeless battlemat.

**Spec: one small table, `wilderness-stand-structure` (d20), rolling stand *structure*, not
species.** Species is a material and a silhouette; structure is what the tactics read.
Proposed rows (structure · trunk density per 100 sq ft · canopy height · undergrowth ·
what it does):

| roll | stand | trunks | canopy | undergrowth | tactical |
|---|---|---|---|---|---|
| 1-4 | Open grove — mature trees, clear floor | 1 per 400 sq ft | high (30′+) | none | LoS blockers at wide spacing; the ideal fighting wood |
| 5-7 | Closed canopy — dense crowns, dark floor | 1 per 200 sq ft | high, continuous | sparse | tactical ceiling over the whole tray; dim light |
| 8-10 | Thicket — young dense regrowth | 1 per 50 sq ft | low (10-15′) | heavy | heavily obscured; difficult terrain; no ranged lines |
| 11-12 | Edge / ecotone — the wood meets the open | gradient | mixed | heavy at the seam | the single best ambush geometry in the game |
| 13-14 | Blowdown — a storm put the stand on the ground | scattered | none | trunk field | R1-13 and M091 country; cover everywhere, movement nowhere |
| 15-16 | Burn — standing dead, no leaves | 1 per 300 sq ft | none | ash, regrowth | LoS blockers with no ceiling; total visibility upward |
| 17-18 | Riparian — a wooded line following water | linear | mid | dense at the bank | R1-05 pairing; a covered corridor |
| 19 | Stand on broken ground — trees rooted on a slope or scarp | mixed | mid | roots exposed | **the R1-13 case: roots arch over the cut** |
| 20 | Coppice / worked — cut and regrown on a cycle | regular grid | low | clear | human hands; regular spacing reads as ownership |

Two things this table deliberately does *not* do: it does not name species (that is the realm
skin's job — an `ash`-realm closed canopy and a `lost-world` closed canopy are the same
structure), and it does not roll individual tree positions (that is the engine's placement
pass, seeded and deterministic per segment).

## 3.5 R1-13 · THE ROOT AND BRANCH BRIDGE NETWORK — in-engine, procedural

**Real-world construction first.** A tree's surface roots are not decoration. Where a tree
grows on a bank, a boulder, or a stream cut, the soil under the roots washes away and the
root is left spanning the void — it becomes a **beam**. Round section, one to three feet
thick, spanning five to twenty feet between anchor points, tapering away from the trunk, with
bark that gives grip and a top surface worn smooth where anything walks it regularly. A low
branch does exactly the same thing in the air: it leaves the trunk at eight to fifteen feet,
runs near-horizontal for ten to twenty-five feet, thickens toward the trunk, and sags under
load. **Both are beams with an anchor at each end.**

**So the system is a graph of beams, not a tree.** That is what makes it procedural,
morphable, and — crucially — *derivable from whatever terrain rolled*, because the anchors
come from the terrain chassis.

**Anchor sources (all already produced by rung 1):** cliff top · cliff foot · ledge · chasm
rim · crevice wall · bank lip · hill crest · boulder crown · terrace face · an M090 bole
socket · an M093 root-mass socket · the tray edge.

**Morph parameters.**

*Topology* — `anchorSet[]` (drawn from the above) · `spanCount` (1–6) · `junctionCount`
(nodes where 3+ spans meet — **each junction is a standing decision point**, and this is the
parameter that turns a bridge into a network).

*Per span* — `lengthCells` (1–4 = 5–20 ft) · `diameterFt` (1–3) · `sagRatio`
(0 = rigid root; 0.15 = a springy limb that moves under load) · `taper` (0–0.5, thick at the
anchor) · `heightAboveDatumH` · `barkCondition` (`sound` | `mossy-slick` | `dead-brittle`) ·
`wornTread` (bool — the smooth top that says things walk here, which is also the honest
telegraph that the route exists).

*Derived, not authored* — `treadWidthFt` from `diameterFt`: **under 2 ft = a balance check ·
2 ft or more = normal movement · 5 ft or more = a real 1-cell tactical footprint.**

*Ground relationship* — `undercutDepthH` (how far the ground fell away beneath; **this is
what makes an arch a bridge instead of a bump**) · `buttressFlareCells` (the widening where
the root meets the trunk — the classic hiding place).

**The three tactical roles, simultaneously, which is the whole point:**

1. **Route.** A span crosses a chasm, pond, or crevice the ground cannot. `heightAboveDatumH`
   0h = a root you step over (difficult terrain); 1–2h = a root you step *on* (cover plus a
   low route); 4h+ = a branch, which is real high ground with a fall beneath it.
2. **Elevation.** Climb DC on the banded ladder (12 / 15 / 17 + condition modifier, one check
   per storey — `STRUCTURE-KIT` R3), with `barkCondition` setting the band and the fall
   height set by the terrain below, not by the branch.
3. **Cover.** The underside of an arch is total cover from above and half cover from the
   flank. The gap under a buttress root is the cheapest legitimate hide on the board.

**The hostile case, and a ruling.** A `dead-brittle` span is the unstable edge the marathon
players kept inventing.

> **Ruling: collapse is a declared property with a countable trigger — never a DM
> improvisation.** `{ trigger: weight | damage | round, threshold: n, result: span-fails }`,
> visible on inspection, and the receipt records it.

Grounds: marathon finding #2 — two players independently invented bait-onto-unstable-edge
with no support from the engine — plus the governing law's own requirement that *"the player
can recognize what changed after a choice."* An unstable span the player cannot detect is not
a tactic, it is a trap; an unstable span they *can* detect is the best decision terrain
offers.

**Morph proof required (this is the acceptance test for the piece).** The same
parameterization must produce all four, with no code branch:

1. a single root arch over a 1-cell stream cut (`spanCount 1, undercutDepth 1h`);
2. a three-span root bridge across a 3-cell chasm (`spanCount 3, junctionCount 1`);
3. a branch highway at 4h between two boles (`heightAboveDatum 4h, sagRatio 0.15`);
4. case 2 with one span collapsed and its stub still climbable
   (`barkCondition dead-brittle`, trigger fired).

## 3.6 Meshy tree candidates — four families, eight models

Queue-format, following `MESHY-WILDERNESS-SETPIECE-QUEUE`'s conventions exactly: one ID per
family, plain-English name plus procedural purpose, four intentional variants
(**A canonical · B silhouette · C failed · D adapted**). IDs `M090`–`M093` continue that
document's `M076`–`M089` without collision.

**These are PROPOSED. Not authorized, not queued, not budgeted.** They would enter the slate
through `MESHY-PREMIUM-MONTH-1-MODEL-SLATE`'s own process, after Batch-4 settles — never as
an in-flight insertion (that queue's §5.2 constraint 1).

### The families

| ID | family and procedural purpose | four models | rolled demand |
|---|---|---|---|
| **M090** | **Standing bole (canopy-suppressed).** One trunk from ground to a clean crown-cut at ~15 ft, the crown implied by branch stubs, a light gobo, and a shadow decal rather than modelled leaves. Serves d50 row 2 directly — a 5′×5′ space granting three-quarters cover and blocking line of sight. Material recolor alone must span broadleaf, conifer, and petrified without new geometry. | A broadleaf bole with buttress root flare · B conifer bole with whorled stub ring · C fire-hollowed / lightning-split bole · D climbing-adapted bole (cut steps, driven pegs, a fixed rope) | d50 rows 2, 3; `wilderness-area-type` boundary `Dense, impassable tree/stalagmite trunks` at 16.67% of arrivals |
| **M091** | **Fallen trunk and root plate.** A toppled tree — the horizontal trunk *plus* the vertical disc of root and earth torn up at the base, which is the silhouette people actually recognize and the half nobody models. Separable trunk / plate / bark shell so the hollow variant reuses the mass. | A intact trunk with raised root plate · B hollowed trunk, both ends open · C shattered or burned trunk in three pieces · D bridging trunk with hand-line and worn tread | d50 row 6 (half cover, vault costs 5 ft), row 22 (total cover, crawl), row 24 (natural bridge); census `Great Fallen Log`, `Hollow Log` |
| **M092** | **Stump and coppice stool.** The cut or broken stump at 2–5 ft — 1h to 2h, therefore a *standable top*. Cheapest cover per generation in the whole forest register, reads instantly at the fixed camera, and populates a stand for almost nothing. | A sawn stump, visible rings · B storm-broken splintered stump · C rotted hollow stump with a cavity · D worked stump — chopping block, seat, or shrine base | `wilderness-stand-structure` rows 13/15/20 (proposed); the blowdown and coppice cases |
| **M093** | **Exposed root mass — the climbable donor.** *Not a tree.* The aboveground root architecture of a giant tree whose trunk is off-tray: arching roots, buttresses, and the voids under them. This is the silhouette half of R1-13; the engine owns every span, every walkable top, and every socket. | A arching buttress root pair spanning a gap · B root wall / undercut bank face · C dead, hollowed, partly collapsed mass · D adapted as shelter or bridge, with worn tread | census `Petrified Root System`, `Hanging Roots` (`wilderness-feature` 243: `30' wide curtain`); `wilderness-stand-structure` row 19 (proposed); Adam's explicit ask |

### The candidate slate — 8 models, two waves

Shaped per the queue's own gate logic (Gate 3: canonical A first for breadth; Gate 4:
variants in value order). Poly targets follow the Month-1 asset-class table — small fixture
300–700 · ordinary prop or cluster 700–1,500 · large formation 1,500–3,000 — and are first
targets only.

| pri | wave | status | jobId | modelId | var | category | family | variantSubject | targetPolys | grade | why this one |
|---:|---|---|---|---|---|---|---|---|---:|---|---|
| 1 | T1 | proposed | M090-A | M090 | A | natural | Standing bole | broadleaf bole with buttress root flare | 800 | silhouette | d50 row 2 is the most-placed vegetation row; one cell, one silhouette |
| 2 | T1 | proposed | M091-A | M091 | A | natural | Fallen trunk and root plate | intact trunk with raised root plate | 1,400 | **usable** | serves three d50 rows at once (6, 22, 24) |
| 3 | T1 | proposed | M093-A | M093 | A | natural | Exposed root mass | arching buttress root pair spanning a gap | 1,800 | **usable** | Adam's explicit ask; the R1-13 donor |
| 4 | T1 | proposed | M092-A | M092 | A | natural | Stump and coppice stool | sawn stump with visible rings | 500 | **usable** (top is a 1h–2h support surface) | cheapest cover per generation; populates a stand |
| 5 | T2 | proposed | M091-D | M091 | D | natural | Fallen trunk and root plate | bridging trunk with hand-line and worn tread | 1,400 | **usable** | the route case; d50 row 24 `Natural Bridge` |
| 6 | T2 | proposed | M093-D | M093 | D | natural | Exposed root mass | adapted as shelter or bridge, worn tread | 1,800 | **usable** | the climbable case Adam named |
| 7 | T2 | proposed | M090-C | M090 | C | natural | Standing bole | fire-hollowed / lightning-split bole | 800 | silhouette | the queue's own L1 finding — the weathered state is the common case, not the edge case |
| 8 | T2 | proposed | M091-C | M091 | C | natural | Fallen trunk and root plate | shattered or burned trunk in three pieces | 1,400 | silhouette | the blowdown and burn stand rows |

**Eight models. Four families. That is "several," not a forest** — and it is deliberate:
every additional tree family buys silhouette we then have to keep out of the camera's way.

**Grade assignment, under Adam's ruled Q4** (`SETTLED-LIFE-SITES-PROGRAM` §7, 2026-07-27:
*"Buy silhouette for all wilderness curiosities; mark a small usable subset per family"*).
Terrain is the register that ruling explicitly opens: **usable = anything a figure stands on
or climbs.** Five of eight are usable-grade — M091 (all), M093 (all), M092-A — and they owe
the extra contract: declared walkable top surfaces, climb faces with DC bands, sockets for
R1-13 span attachment, and cover values. M090 and the failed variants stay silhouette-grade:
a bole is cover, and cover needs a footprint and a collision proxy, not a walkable top.

**The two-failure stop rule applies** (queue §5.2 constraint 3). **M093 is the family most
likely to trip it**, and the reason is already known and named by that document: thin-strand
geometry. A root mass presented badly becomes hair. The reference image must show **broad
braided masses with construction-scale planes**, exactly as `M087`'s brief already warns for
the thorn barrier. If M093 fails twice for that reason, its slots return to M091, which
covers most of the same tactical ground with easier geometry.

---

# 4. THE CLAYROOM PROOF PLAN

## 4.1 The fixture — `CL-F07 terrain-bench` (PROPOSED)

`CLAYROOM-RESET-LADDER` owns the fixture family `CL-F00`…`CL-F06`; `CL-F06 seed-stress` is
the last and is unbuilt. **`CL-F07` is proposed as an extension of that family and must be
adopted through that document, not declared here.** This section specifies what it would
have to do.

| | |
|---|---|
| **Primary question** | *Does generated ground carry tactical meaning at the fixed camera?* |
| **Content** | one arrival-sized field (the census median, 96 cells / 60′×80′), the thirteen rung-1 pieces, a six-foot human witness, the production camera |
| **Ladder position** | after `CL-R3` (construction grammar — terrain needs its retaining faces, stairs, and ramps) and after `CL-R4` (material routing — terrain is 90% material). **Before** Guard Post 1, which needs terrain to site itself on. |
| **Non-negotiable** | production compiler, production geometry builders, production materials, lights, camera, sprites, and cutaway path. A terrain display may author canonical test inputs; it may **never** invent a second renderer. |

## 4.2 The four required conditions, every rung

Every rung's proof carries all four. This is the brief's own list, made specific.

**1 · Fixed production camera.** Governed zoom/pan/focus, no orbit (clay-proof contract
item 2). Plus one terrain-specific addition: the **72° map-reading pitch** that `CL-R3`'s
governed `ALL WALLS` mode already uses. Terrain has a failure mode walls do not — a cliff or
a hill can be *completely invisible* at a low pitch because a height difference reads as a
texture change. **Every terrain capture is a pair: the production camera and the 72°
strategic read.** If a piece is only legible in one of them, it is not built.

**2 · Standee envelopes.** The six-foot human witness on **every relief datum in the same
frame** — foot of the cliff, top of the cliff, mid-terrace, in the chasm, wading the pond.
Plus the small and large envelopes, because a 2h step that a Medium creature climbs is a wall
to a Small one, and a Large creature cannot enter a 1-cell crevice at all. The three
envelopes read *differently* against terrain than against architecture, which is exactly why
`CL-F03`'s cast does not substitute.

**3 · Changed seeds.** Two minimum (contract item 9). For terrain the seed test is stricter
than for architecture, because terrain's whole claim is parametric variation: **the same
piece at three parameter sets in the same frame** — a 2h cliff, a 5h cliff, and a 12h cliff
side by side — proving the morph is real and not three authored assets. The guidelines' own
words: *"Does the layout remain interesting across changed seeds, rather than depending on
one hand-authored arrangement?"*

**4 · The hostile case.** One per rung, and each one is chosen to be the case most likely to
break that rung:

| rung | hostile case |
|---|---|
| 1 | The **16-cell tray** (20′×20′, the census minimum) asked for a chasm that needs 6 cells on the crossing axis. Must walk down and record `degradedFrom`, never produce an illegal board. |
| 1 | The **256-cell tray** (80′×80′) with one terrain draw — proving that sparse terrain on a big field is still a *composition* and not a dropped object. |
| 2 | Two realms on the **same committed layout, same ids** — the `CL-F04` two-parents pattern. If the ground reads as recolor rather than as a different place, rung 2 has failed and the fix is M7's weight vectors, not more materials. |
| 3 | A Strange piece **beside its Grounded host** in one frame. If the viewer cannot tell which one is strange, the band grading is decorative. |
| all | **Dark.** Contract item 8. Terrain in darkness is the hardest readability case in the game — a cliff edge you cannot see is a fall you cannot avoid, and the honest answer may be that the edge must be telegraphed by something diegetic (a lighter material at the lip, vegetation, the sky behind it) rather than by an unexplained light. Darkness may be dark; the edge must still be findable. |

## 4.3 Per-rung proof plans

### Rung 1 proof — `CL-F07a`

**Claim:** the thirteen pieces are one chassis, and they build what the tables roll.

Captures — clay, tactical overlay, and dressed over the same committed ids (contract item 4):

1. **The thirteen-piece sheet.** Every rung-1 piece on one field at production camera and at
   72°, with the human witness on each. This is the "does it exist" frame.
2. **The one-clamp proof.** A hill and a cliff generated from **the same parameter set with
   only `slopeClamp` changed.** If they are not the same generator, the chassis claim in §2.0
   is false and this document is wrong.
3. **The boundary sheet.** All six `wilderness-area-type` boundary strings built as the
   perimeter of the same 60′×80′ kidney-shape playfield. Six frames, one layout. This is the
   single highest-value capture in the program because it discharges the 33.3%-unbuilt
   finding directly.
4. **The route proof.** A named entry from a real area-type row resolving to a walkable edge
   cell, with the approach / deployment / objective / retreat path drawn (contract item 5),
   and **two meaningfully different viable plans** named with their tradeoffs (item 6). For
   terrain the two plans must be *terrain-caused*: cross at the span vs go around; take the
   high flank vs the covered gully.
5. **The walk-down proof.** The 16-cell hostile case, with `degradedFrom` in the receipt.
6. **The support-graph proof.** The `CL-R3` traversability grid projected onto terrain —
   every walkable cell claimed, every guarded slope excluded, no sub-cell surface minting a
   false 5-ft footprint. Zero standable surfaces unreachable without flight.
7. **Dark.**

**Executable gate (back end — mine to prove, per the Teeth Law):** zero walkable cells above
30° · zero unowned faces at 2h+ neighbour deltas · zero unreachable standable surfaces ·
all 6 boundary strings resolve · all 50 d50 rows resolve or are declared non-terrain with a
reason · all 13 footing coverage strings place · determinism (same segment id → byte-identical
heightfield, twice, in separate page loads).

**Front-end gate (Adam's — never mine):** does the ground look like ground?

### Rung 2 proof — `CL-F07b`

**Claim:** eleven realms over thirteen pieces, from materials alone.

1. Four realms on the same committed layout and ids: `lost-world`, `ash`, `high-seas`,
   `bright-kingdom` — chosen because they should look maximally unlike each other, so if
   *these* four read as recolor, all eleven will.
2. The **band-inheritance proof**: the same Grounded piece in a `cosmic` skin, with its
   receipt showing the band **unchanged**. This is the §2.3 ruling made countable.
3. The M12 proof: one footing roll driving both the mechanical impact and the realm surface
   name, with the prose twin printed beside the frame (the blind-playable law).
4. Hostile: the two-realm side-by-side. Dark.

### Rung 3 proof — `CL-F07c`

**Claim:** Strange terrain is a transformation of rung 1, and it grades honestly.

1. Four rung-3 results **beside their rung-1 hosts**, same ids: petrified waterfall / cliff ·
   basalt columns / terrace · glass desert / field · mirror-of-the-sky / pond.
2. The **no-new-parameter proof**: the receipt lists the parameter delta from host to
   transformed. If any parameter is new, the piece is rejected back to rung 1.
3. A band-distribution receipt over 200 generated trays showing Strange landing near the
   authored 10% at baseline tier and rising with region fray.
4. Hostile: Strange beside Grounded — can you tell? Dark.

### Rung 4

Not proved. Not authorized. See §2.5.

## 4.4 What must be true before terrain is called proved

Borrowing the proof queue's own bar, unchanged: **a terrain rung earns `CLAY-PROVED: PASS`
only when the canonical hero sheet, the changed-parameter sheet, and the adversarial sheet
all pass. One flattering image is insufficient.** And per `CLAUDE.md`'s gate split: I own the
measurable back end and will never declare a visual "on" — every front-end verdict in this
program is Adam's, delivered as a capture packet.

Failures are retained as diagnostic evidence, never hand-authored away (contract item 12).

---

# 5. THE IN-ENGINE / MESHY SPLIT

## 5.1 The law

> **THE TERRAIN SPLIT LAW (proposed).**
> The **engine** owns every surface a figure can occupy, every void a figure can fall into,
> and every edge where those two meet.
> **Meshy** owns bodies that sit on that surface and never change its walkability.

**The test, and it is a single question:** *would changing this thing's size change how many
five-foot cells are walkable?*

- **Yes → engine.** It is terrain. It must be parametric because the tray it lands in ranges
  from 16 to 256 cells and a fixed-size mesh cannot serve both.
- **No → Meshy.** It is a body. Its silhouette is the whole value, and silhouette is what
  Meshy is good at.

## 5.2 The split applied

| thing | owner | grounds |
|---|---|---|
| cliff · bank · hill · chasm · crevice · pond · puddle · terrace · berm/trench · scree · mountainside · the terrain field | **engine** | every one changes walkable cell count with size. The queue already routed `Towering Mesa`, `Terraced Slopes`, `Natural Amphitheater`, `Overhanging Cliff`, `Bottomless Crevasse`, `Earthwork Trench`, `Narrow Fissure`, `Chasm with Landbridge`, and `Lava Tube` (28 instances) to *"engine terrain / elevation authority"* for exactly this reason |
| boulder **cluster** | **engine** | spacing and gap width are the tactical content (d50 row 12) |
| boulder **body** | **Meshy** | already bought — M001 / M002, *"extend, do not re-buy"* |
| tree bole | **Meshy** | occupies exactly one 5′ cell at any size — d50 row 2's own footprint |
| stump | **Meshy** | one cell; its top is a support surface the engine declares |
| **fallen trunk** | **split — the contested case, resolved below** | |
| root mass | **Meshy body + engine spans** | the mass is silhouette; every walkable span, socket, and collapse trigger is engine |
| canopy | **neither** | a rule, a gobo, and a shadow decal — §3.3 |
| anomaly behaviour | **engine** | the queue's `engineOwns` clause already says so |
| ground material | **material lane** | the queue's X2 cluster (`Lava Flow`, `Mud Flat`, `Glass Desert`) is *"surfaces and volumes of terrain, not objects"* |

## 5.3 Two contested cases, resolved

**The fallen trunk.** A trunk you *vault* is a body (row 6: half cover, 5 extra feet). A
trunk you *walk* is a surface (row 24: a precarious span, DC 10 or fall off). Same object,
two sides of the law.

> **Resolution: buy the body; declare the walkable top as an engine-owned support surface
> projected onto the donor's declared top plane.**

Grounds: this needs no new machinery. The Month-1 admission rule *already* requires every
donor to arrive with *"declared footprint/height/cover/walkability/mounting class"* before it
is a production asset. Walkability is on that list. And `CL-R3`'s traversability grid is
already *"a support-surface projection rather than one base-floor plane… rebuilt from live
floor-top truth plus compiled shell tiers and tagged geometry surfaces,"* with the explicit
guard that *"small object tops are clipped to their real bounds and do not claim a false
5-ft tactical footprint."* A trunk top is precisely that case, already solved.

**The natural arch — closing an open queue item.** `MESHY-WILDERNESS-SETPIECE-QUEUE` §3 left
this open, verbatim: *"`Natural Arch` (3) and `Coral Brain` (2) sit exactly on the
terrain/prop line… Recommend they be resolved once, as a rule about scale, rather than
per-row."*

> **Resolved by the split law: an arch is engine when a figure can pass under it or walk over
> it — it changes walkable cells in two layers at once. It is Meshy when it is a landmark
> smaller than two cells, where it changes nothing and is pure silhouette.**

The same rule disposes of `Coral Brain` (Meshy — a body), `Basalt Columns` (engine — they are
stepping stones, row 18's own footprint), and any future row on that boundary. **This is a
proposed resolution to another document's open question and should be adopted there, not
here.**

## 5.4 Why this split is the cheap one

Rung 1 is thirteen pieces on one chassis and buys **zero** Meshy generations. Rung 2 is
eleven realms over those thirteen and buys **zero**. The entire tree program buys **eight**.
Every landform in the census's T1/T2/T3/T4 classes — 102 instances — is served by geometry
that already has to exist for the boundary problem.

The alternative — buying landforms as meshes — fails three ways and each has already been
proven somewhere in this repo: a fixed-size mesa cannot serve a 16-cell and a 256-cell tray
(the queue's own words) · a bought landform cannot own the terrain hole the engine needs ·
and it makes procedural breadth depend on a finite asset catalog, which
`GRAPHICS-CONVERGENCE-CHARTER` §5 names as an explicit reject condition.

---

# 6. FOUNDER QUESTIONS

Four. Each is taste or product direction, not research, implementation, or a proof failure —
per the guidelines' §6 bar. Everything else in this document I decided and recorded with
grounds.

---

### Q1 · How vertical should an ordinary battlemat be?

**The choice.** When the game rolls a wilderness clearing and there is no special reason for
drama, how much does the ground go up and down? This sets the default for thousands of
scenes.

**Three visible alternatives.**
- **(a) Mostly flat, one elevation event.** Roughly today's de-facto behaviour. Flat ground,
  one feature dropped on it. Fastest to read, fastest to fight on.
- **(b) A two-or-three-datum board as the default.** Every tray has a low, a mid, and a high.
  Elevation is ordinary rather than special.
- **(c) Full FFT.** Elevation everywhere; flat is the exception that needs a reason.

**Recommendation: (b).** The marathon is unusually clear here — elevation and unstable ground
were the #1 and #2 played demands, and two separate players invented terrain-as-weapon with
no support from the engine. (a) leaves that entirely to the DM's improvisation, which is what
the mining found happening. (c) makes every fight a climb and slows the median turn, and it
would put a retaining face on every scene's geometry budget forever.

**What it changes later.** The chassis is the same either way — this sets the *generator's*
default datum count, which sets how much face geometry every scene pays for.

**Easy to revise?** Yes. One weight vector in M4's proposed elevation-profile table.

**What you need to see.** Three trays, same encounter, same camera, at 1 / 2 / 3 datums.

---

### Q2 · Does water get a moving edge?

**The choice.** Is a pond a fixed shape rolled at the start of a scene, or is its water level
a live number that can rise while people are standing in it?

**Three visible alternatives.**
- **(a) Static.** Water is a plane set at roll time and never moves.
- **(b) Live datum.** `waterDatumH` can change during a scene — tide, flood, dam break,
  rain — and because the shoreline is derived from where ground crosses water, the entire
  flooded footprint recomputes correctly and for free.
- **(c) Authored setpieces only.** Rising water exists but only in hand-built scenes.

**Recommendation: (b).** Marathon demand #4 — water and flood as *recurring dramatic
architecture* — runs across four separate sets and is the spine of an entire PC's back half,
and nothing in the corpus models it. It is also the honest mechanism for the flooding
transform `SETTLED-LIFE-SITES-PROGRAM` already ruled in. And the cost is genuinely one
parameter, because §2.3's pond derives its shore rather than authoring it.

**What it changes later.** It makes every water surface a per-turn state and forces the
movement and cover systems to re-read terrain mid-encounter. That is real scope. **Hard to
revise downward** once systems depend on it.

**What you need to see.** One pond, one tray, one set of ids, at three water datums — with
the shoreline visibly finding different ground each time.

---

### Q3 · How strange may ordinary ground get?

**The choice.** Terrain is currently outside the Spice Curve entirely — no terrain table in
the game carries a band column. So this is a genuine open question rather than a tuning dial.

**Three visible alternatives.**
- **(a) Terrain is always Grounded.** Strangeness lives in props, light, and creatures; the
  ground stays honest. Even the weirdest world stands on ordinary rock.
- **(b) Terrain grades with the band like everything else.** A petrified waterfall is a real
  rollable piece of ground, rare and honest.
- **(c) Terrain grades, but only its material changes — never its behaviour.** Strange-looking
  ground that acts normally.

**Recommendation: (b), governed by §2.3's law** — *a terrain piece never changes its band by
changing its material; the transformation is the rolled fact, not the substance.* (a) makes
the strangest realms visually flat where it matters most. (c) is a lie the player will catch
the first time they touch glowing ground and nothing happens, which is exactly the
"validators preserve the thing's job" failure.

**What it changes later.** Whether we ever author the separate Commitment-class table that
rung 4 would need — because today's Fork ceiling means **no Volatile or Mythic terrain can
ever roll**, whatever we build.

**Easy to revise?** The band column is easy. The Commitment table is a real authoring
commitment.

**What you need to see.** One 60′×80′ tray with identical routes and identical ids, at
Grounded, Strange, and Volatile — so the question is "is this the right amount of weird,"
not "is this a different level."

---

### Q4 · Trees: how bare is too bare?

**The choice.** The canopy restraint you asked for has a visual cost, and it is the one thing
in this program I cannot judge for you.

**Three visible alternatives.**
- **(a) Boles, stubs, and a light gobo. No leaf geometry anywhere.** The recommendation.
- **(b) A thin high canopy card above the camera's read plane** — leaves that exist but never
  occlude the board.
- **(c) Real crowns on the tray edges only**, none in the playfield.

**Recommendation: (a).** Three supports. The camera-side omission law that rescues walls does
not transfer — you can omit half a wall and the room still reads; omit half a canopy and it
reads as damage. The table already treats canopy as a rule with no mesh (d50 row 4's tactical
ceiling). And it is your own instruction: climbable roots over crowns.

**The risk, stated honestly:** a forest of bare boles may read as a **burned** forest rather
than a wood. That is a real aesthetic failure mode and it is not one I can measure.

**What it changes later.** Whether the forest case needs an answer the other ten realms do
not.

**Easy to revise?** Yes — (b) is additive over (a) and costs no geometry rework.

**What you need to see.** One 60′×80′ forest tray at the production camera in all three
treatments, plus the same tray in darkness — because if the bare version survives the dark
frame, it is probably right.

---

# 7. WHAT THIS DOCUMENT DOES NOT ANSWER

Stated plainly, per the honesty bar the sibling studies set.

1. **The census's wilderness numbers come from unseeded `Math.random()`** across 539 arrivals.
   Re-running reproduces the *shape*, not the counts. Every claim above 20 instances is safe;
   the single-digit landform counts in §1.2F are within noise of each other and their order
   should not be defended. The **structural** percentages (the 16.67% boundaries, the 94.3%
   entry column, the 50-row footprints) are exact — they come from parsing the table, not
   from sampling it.
2. **The terrain classification in §1.2F is mine**, not a founder ruling. Reasonable people
   would move `Petrified Waterfall`, `Mirror of the Sky`, `Ancient Barrow`, and the whole
   boulder/landform boundary. Counts exact; bins a proposal.
3. **No parameter number here is settled.** Per the guidelines' §8 warning: *"Numbers in a
   working spec are hypotheses until clay and play accept them."* Every range in §2 —
   `riseH` 2h–12h, `widthCells` 2 = jumpable, the M4 distribution — is a starting hypothesis.
4. **The M4 elevation-profile distribution is invented**, modelled on `room-elevation-profile`'s
   proven shape but not tested against a single wilderness roll. It needs a 500-tray dry run
   before it is authored.
5. **No reference images exist for M090–M093.** The Terra lane's per-row reference work is
   unstarted, and the Month-1 rule stands: one row, one reference image; variants never share
   a canvas.
6. **I did not read `data/realm-surfaces.js`** (settings-denied). Realm surface identities
   come from `REALM-SURFACES-DRAFT.md` and `REALM-SURFACES-WIRING.md`. If the shipped data
   diverged from the draft, §2.3's worked examples need re-checking.
7. **`CL-F07` is proposed, not declared.** `CLAYROOM-RESET-LADDER` owns the fixture family and
   must adopt it.
8. **The natural-arch resolution in §5.3 belongs to another document.** It should be adopted
   in `MESHY-WILDERNESS-SETPIECE-QUEUE`, not treated as settled by its appearance here.
9. **Rung 4 is unbuildable today** and this document does not pretend otherwise.
10. **Nothing here is `CLAY-PROVED`.** Not one frame has been captured. The prose being
    persuasive is explicitly not the bar (guidelines §7).

---

## Appendix A — decisions made in this lane, with grounds

Recorded per the decision-capture rule. **None is a founder ruling**; each is a design-lead
call under the decision latitude, and any of them can be overturned.

| # | decision | grounds |
|---|---|---|
| D1 | **One heightfield chassis, thirteen pieces** — hills and cliffs are the same generator with one clamp changed | real-world construction (graded ground) + the existing 5-ft / 2.5-h / 30° laws; ≤1h per cell = 26.57° = the ramp CL-R3 already builds |
| D2 | **Berm and trench are one piece with a sign flip** | you dig a ditch and the spoil *is* the bank; merges d50 rows 1 and 5 |
| D3 | **Bank stays separate from cliff** | 16.67% of arrivals roll a 10-ft bank; 10 ft = 4h = one storey = one climb check, where a 20-ft cliff is two. Merging loses the most common *surmountable* vertical in the game |
| D4 | **Puddles are an information system, not a hazard** | the corpus has 30 hazard footing rows and 12 hazardous d50 rows, and almost nothing that rewards looking; serves marathon demand #1 at zero movement cost |
| D5 | **Mountainside is an edge condition, not an object** | the Meshy queue already routed mesas to the engine — a fixed mesh cannot serve a 16-cell and a 256-cell tray |
| D6 | **Terrace is rung 1, not a variant** | tied-highest landform in the census; the only piece producing *graded* elevation; composes into three other things free |
| D7 | **No canopy geometry in the tactical tray, ever** | the camera-side omission law does not transfer to crowns; d50 row 4 already treats canopy as a rule with a footprint and no mesh |
| D8 | **A terrain piece never changes its spice band by changing its material** | otherwise `chrome` and `cosmic` make every rock Strange for free, breaking SPICE-CURVE §2's honest-rarity premise and the player-tone-agency clause |
| D9 | **Rung-4 terrain is behaviour over rung-1 geometry, never new geometry** | the Meshy queue reached the same conclusion from the purchasing side: *"the object is trivial and the behaviour is the entire content"* |
| D10 | **The Terrain Split Law** — engine owns occupiable surface, fallable void, and the edge between; Meshy owns bodies that never change walkability | one testable question (would resizing it change walkable cell count?) replaces per-row argument |
| D11 | **Fallen trunk: buy the body, engine declares the walkable top** | the Month-1 admission rule already requires a declared walkability class; CL-R3's support-graph already clips small object tops to real bounds |
| D12 | **Natural arch: engine when passable over or under, Meshy when a sub-2-cell landmark** | closes an explicitly open question in the Meshy queue with a scale rule, as that document itself requested |
| D13 | **Promote the d50 to serve dungeons too; demote the d10 to a composition hint** | the d50's rows are already labelled Biome Agnostic with dual nouns that read indoors; avoids authoring fifty dungeon rows |
| D14 | **Biome gets weight vectors over shared rows, not ten biome-specific tables** | one artifact instead of ten; avoids the "same house with worse furniture" failure the 42-roll audit caught; preserves the dual-noun cross-biome reads |
| D15 | **Move the terrain draw out of the enemy branch and up to arrival assembly; draw 1d4** | the governing law explicitly says a site need not be a combat arena, and marathon demand #1 was overwhelmingly a social-stealth demand |
| D16 | **Collapse is a declared property with a countable trigger, never DM improvisation** | two players invented bait-onto-unstable-edge unaided; the law requires that the player can recognize what changed |
| D17 | **Eight Meshy tree models, four families — five usable-grade, three silhouette** | Adam's "several… not too many"; Q4's ruled middle answer with terrain named as the usable register |
| D18 | **Home-settlement terrain: generate once, freeze the receipt, never reroll** | Adam's ruled Q3 — *"one persistent, returnable place… alleys the player learns."* Terrain that rerolls cannot be learned. The persistence unit is the heightfield receipt, not a hand-authored map |
