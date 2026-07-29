STATUS: RECONCILED SOURCE INVENTORY — NO IMPLEMENTATION AUTHORITY (2026-07-28)

---
type: spawnable-inventory
created: 2026-07-27
site: 11 — mixed scale / dragon domain
spec: ../SITE-11-MIXED-SCALE-SPEC.md
research: ../../Reference/Mixed-Scale-Study-0727/README.md
consumer: the spawn-audit lane
---

# SITE 11 — SPAWNABLE CONTENT INVENTORY

## 2026-07-28 adversarial reconciliation

Site 11 proves `ScaleContract`, not a Dragon Lair generator or universal 3:1 threshold. Two
represented scales must create different consequential affordances; the larger body may be
present, absent, or historical. Hoard terrain routes through the shared `GranularMass`
provider sponsored by this proof. The 18.55% tally is broad mixed-scale object supply, not
measured Site-11 activation.

Every concrete thing the Site 11 spec implies can **spawn in play**, mapped to the Engine
table or roller that would produce it — or marked `NO-TABLE-YET`.

## How to read this

**Status vocabulary** is the one in `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md`:
`LIVE` · `LIVE-COMPOSED` · `AUTHORED-UNWIRED` · `ORACLE-MANUAL` · `INTERPRETIVE` ·
`TARGET-ADAPTER` · `NO-TABLE-YET` (this document's addition, for demand with no source at all).

**No table id in this file was guessed.** Every id was read from the `id:` frontmatter of its
Engine markdown source. `tables.js` / `tables.json` were never opened.

**Headline for the audit lane:** Site 11's *content* is already authored and already rolling
in bulk. What is missing is **geometry and admission**, not tables. Counting the 60 rows
below: **29 `LIVE`** · 8 `LIVE-COMPOSED` · 2 `AUTHORED-UNWIRED` · 1 `TARGET-ADAPTER` ·
**20 `NO-TABLE-YET`**. Fifteen of those twenty collapse onto exactly two buys — the aperture
pair and granular-mass terrain (§G).

The imbalance is the point: the highest-volume, most-detailed content in the site (§C, all
`LIVE`) has nothing to render it, while the site's own two inventions do not exist at all.

---

## A. Structures and spatial elements

| # | spawnable | produced by | status | note |
|---|---|---|---|---|
| A1 | Massive Cavern (60'×80' … 80'×100' irregular) | `dungeon-area-type` rows 140–142 etc. | `LIVE` | 33 of 1,473 rolled dungeon rooms (2.24%) came back Massive. The live big-volume source |
| A2 | Massive Hall (40'×60' … 50'×80' with side gallery / annex / columns) | `dungeon-area-type` rows 084–085 | `LIVE` | already carries "six arched windows overlooking the main floor from 12 ft up" and "three stone columns support a shared 20 ft ceiling" |
| A3 | Grand Chamber / Rotunda / Octagon / Staircase | `dungeon-area-type` | `LIVE` | 15 of 200 area rows are big-room rows (7.5%) |
| A4 | Gallery ring at +2 overlooking the centre | `room-elevation-profile` 91–96 | `LIVE` (table is flagged `PROVISIONAL`, Adam's ELEV-1 draft) | the natural attendant-gallery-over-a-big-volume shape |
| A5 | Terraced profile, 2–3 steps of +1 across the room | `room-elevation-profile` 81–90 | `LIVE` | the closest live shape to a hoard slope; see F-block adapter |
| A6 | Chasm/shaft −2..−3 with a bridge or edge path | `room-elevation-profile` 97–100 | `LIVE` | the Mode-D under-body void |
| A7 | **Big-body aperture** (3–4 cells clear, class-capacity bearing) | — | `NO-TABLE-YET` | first `ScaleContract` aperture proof sponsored here; no table, kit, or code |
| A8 | **Small-body service aperture** (1 cell, must exclude a 2-cell body) | — | `NO-TABLE-YET` | the other half of the aperture pair |
| A9 | **Service passage / back-of-house run** at 1 cell clear | — | `NO-TABLE-YET` | conceptually the same object as Site 5's manway; may be inheritable rather than new |
| A10 | Hollow tunnel, 5' wide × 15' long, "Medium creatures must crawl" | `wilderness-tactical-terrain` row 22 | `LIVE` | **the closest live thing to a small-body-only route.** Already carries a body-class gate in its own text |
| A11 | Oversize 2× piece variants (sill, tread, lintel, cap, block) | `STRUCTURE-KIT-CATALOG.md` matrix line, site 11 | `AUTHORED-UNWIRED` | one line of prose; no kit, no spec, no geometry |
| A12 | Rib bay / jaw arch / skull chamber / long-bone post | — | `NO-TABLE-YET` | Mode C. Sockets onto existing post/arch mounts, but the pieces do not exist |
| A13 | Pinned parasitic access (irregular stair, ledge, rail on a mass) | — | `NO-TABLE-YET` | Mode D |
| A14 | Ordinary-scale approach apron (the unscaled-reference ground) | terrain slabs + `wilderness-footing` | `LIVE-COMPOSED` | REQUIRED by the spec's unscaled-reference invariant; composable today |

---

## B. Occupants

| # | spawnable | produced by | status | note |
|---|---|---|---|---|
| B1 | Dragon Lair threat cluster (kobold → wyrmling → Young Dragon boss) | `dungeon-threat-identity-t1` row 28 · `dungeon-threat-identity-t2` rows 25–26, consumed by `walk-archetypes.js` `"Dragon Lair" {types:["dragon"], sizeMax:"gargantuan"}` | `LIVE` | 6 of 253 dungeon walks (2.37%) |
| B2 | Giant Colony threat cluster (Ogre/Half-Ogre → Ettin/Hill Giant → Stone/Frost Giant) | `dungeon-threat-identity-t2` row 38, consumed by `walk-archetypes.js` `"Giant Colony"` | `LIVE` | 1 of 253 dungeon walks (0.40%) |
| B3 | Gargantuan-class standee at 4-cell span | `interiorTacticalSpanFor` (`theater-standee-mount.js`) + `SPRITE_SIZE_SCALE` (`theater-sprites.js`) | `LIVE` | **two live constants disagree** — 4× on the billboard path, 2.2× on the cuboid path (`theater-boot.js:571`), and `blockwright.js` gives Gargantuan the same 3 as Huge. Spec §4.5 |
| B4 | Huge-class standee at 3-cell span | same | `LIVE` | the Golden Seed's occupant class |
| B5 | Attendants / handlers (the small working body) | `dungeon-threat-identity-*` minion tiers · NPC/occupancy machinery | `LIVE-COMPOSED` | no table names "handler" as a role; composable from existing humanoid rows |
| B6 | Squatters inside a Site 11 space | Site 2 guest-family camp property | `LIVE-COMPOSED` | explicitly Site 2's, not Site 11's — spec §12.5 |
| B7 | Salvagers / butchers working a carcass | — | `NO-TABLE-YET` | Mode C/D occupancy. The ship-breaking analogue |
| B8 | Pilgrims / worshippers around a colossus | — | `NO-TABLE-YET` | Mode D occupancy |
| B9 | Absent body (the space with nothing in it) | occupancy machinery's honest-empty path | `LIVE` | the ontology contract's honest-empty-space law already permits it |

---

## C. Props and set-pieces — the site's largest live surface

**All 49 mixed-scale rows of `wilderness-feature` (d303, `table_class: Fork`) are `LIVE`.**
Census: 100 of 539 wilderness arrivals (18.55%) across 45 distinct rows. Each row already
carries a footprint, a height, and a tactical effect. Listed here by the *geometry class* the
spec would have to build, not one row per line.

| # | geometry class | rows (d303) | status | authored tactical effect the geometry must honour |
|---|---|---|---|---|
| C1 | **Enterable interior volume** | 046 Colossal Statue (Head) · 064 Gargantuan Ribcage · 066 Giant Shell · 110 Giant Cauldron · 131 Giant Bird Nest · 137 Giant Footprint · 206 Ornate Birdcage (Giant) · 255 Gargantuan Helmet · 256 Petrified Dragon · 288 Giant Drum · 294 Giant Skeleton (Beast) · 296 Giant Pitcher | `LIVE` | "can hide inside the mouth" · "can walk inside" · "interior holds up to 4 Medium creatures" · "can fight from inside the visor" · "mouth forms a cave" · "hollow interior" · "can fight from inside the neck" · "total shelter from weather" · "can lock creatures inside" |
| C2 | **Multi-level ledge / platform** | 047 Colossal Statue (Hand) · 049 Beast Statue · 238 Stone Hand · 280 Giant Anvil | `LIVE` | "fingers form multi-level ledges" · "can ride/mount for elevation" · "palm creates a natural elevated platform" · "flat top for elevation" |
| C3 | **Ramp / bridge / traversal** | 119 Colossal Chain · 252 Giant Spear · 256 Petrified Dragon (wings) · 153 Terraced Slopes | `LIVE` | "acts as a bridge or barrier" · "can be run up like a ramp" · "wings form ramps" · "each step provides half cover from the step below" |
| C4 | **Slotted cover (anatomy)** | 064 Gargantuan Ribcage · 227 Giant Skeleton (Humanoid) · 294 Giant Skeleton (Beast) · 065 Gargantuan Skull (eye sockets) | `LIVE` (row) / `AUTHORED-UNWIRED` (the cover class) | "half cover through the ribs" · "eye sockets act as arrow slits". See D5 |
| C5 | **Alley / gap through a mass** | 148 Split Boulder | `LIVE` | "creates a 5-foot-wide alley directly through it" — a body-class gate in miniature |
| C6 | **Plain cover monolith** | total cover: 032 · 062 · 092 · 120 · 219 · 253 · 262 · 266 · 271 · 283 · 289 · 291 · 298 — half cover: 136 · 222 · 245 · 254 · 257 | `LIVE` | the plain oversize obstacle; the cheapest class and the most numerous. 266 additionally "impassable barrier" |
| C7 | **Difficult-terrain / disturbed mass** | 226 Rubble Field (Colossal) · 273 Giant Campfire · 286 Giant Birdcage (Smashed) · 269 Giant Bear Trap · 135 Gargantuan Shed Skin | `LIVE` | 269 carries a hazard ("4d10 piercing if triggered"); 135 carries a stealth penalty ("rustles loudly if stepped on") |
| C8 | **Hazard / corpse mass** | 130 Beached Leviathan | `LIVE` | "DC 12 Con save or Poisoned (stench)" — a live carcass with a live hazard |
| C9 | **Droppable / triggerable oversize** | 300 Giant Chandelier | `LIVE` | "can be dropped to deal massive damage" — the one authored *interactive* oversize object |
| C10 | **Sign-of-passage at the wrong height** | claw-scored ceiling at dragon height · giant-scale tools scattered · furniture smashed or absent · ceiling damaged by casual movement | `dungeon-threat-identity-t1/t2` Dragon Lair + Giant Colony env-tell columns — `LIVE` | **already authored, verbatim.** The best free mixed-scale dressing in the engine |
| C11 | Handler-scale props (feed, buckets, brushes, tack, lashings) | `dungeon-set-dressing` · `wilderness-set-dressing` | `LIVE-COMPOSED` | no table names stable/handler kit; composable |
| C12 | **Tether point, mounting block, feed station** | — | `NO-TABLE-YET` | the Mode-B mechanism set |

**Coverage note, so the classification stays checkable.** C1–C9 account for 47 of the 49
mixed-scale rows. The two not classed are `214 Giant Chessboard` (40'×40', "normal terrain,
but triggers paranoia in players") and `276 Giant Sundial (Broken)` (30' diameter flat,
"normal terrain") — both are flat-decal rows with no geometry demand beyond a large ground
decal, and both are listed here rather than silently dropped. Several rows appear in two
classes (e.g. `256 Petrified Dragon` is C1 *and* C3; `064 Gargantuan Ribcage` is C1 *and* C4)
because their authored tactical effect asks for both.

---

## D. Terrain, footing, and cover

| # | spawnable | produced by | status | note |
|---|---|---|---|---|
| D1 | **Hoard terrain — stable band (1 h/cell, 26.6°)** | — | `NO-TABLE-YET` | shared `GranularMass` provider sponsored and first stress-proved here; Site 7's brief is already waiting on it |
| D2 | **Hoard terrain — unstable band (2 h/cell, 45°), slides when disturbed** | — | `NO-TABLE-YET` | — |
| D3 | **Hoard terrain — flowing / engulfing state** | — | `NO-TABLE-YET` | licensed only with a draw-down agent; Ideal-horizon |
| D4 | Rampart of Bone/Fossil — "massive ribs of a dead leviathan", 5'×20' | `wilderness-tactical-terrain` row 36 | `LIVE` | the one live anatomy-as-cover piece |
| D5 | **`Slotted Cover` as a cover class** | `wilderness-tactical-terrain` row 36 prose | `AUTHORED-UNWIRED` | "Three-Quarters Cover, but does not block Line of Sight (can see/shoot through the ribs)." No consumer found in `src/`. **Site 11 is its natural consumer** — must go through the existing cover pipeline as a `TARGET-ADAPTER`, not a parallel system |
| D6 | Compacted ground where a heavy body stands | `wilderness-footing` · `dungeon-set-dressing-condition` | `LIVE-COMPOSED` | a footing/condition composition, not a new noun |
| D7 | Coin cache (the *loot*, not the landform) | `dungeon-loot-coin-cache` | `LIVE` | reference table; the generator computes coin inline by tier and BFS depth. **This is loot, not terrain** — the distinction the spec insists on |
| D8 | Hoard fragment trails leading toward the finale | `dungeon-threat-identity-t1/t2` Dragon Lair env-tell | `LIVE` | authored hoard *evidence*, already rolling, with nothing to point at |
| D9 | Spoil / bone / salvage accumulation mass | — | `NO-TABLE-YET` | same geometry as D1–D3, different material |

---

## E. Situations, hooks, and objectives

| # | spawnable | produced by | status | note |
|---|---|---|---|---|
| E1 | Dungeon problem / hazard / discovery in a big volume | `dungeon-problem` · `dungeon-hazard` · `dungeon-discovery-*` | `LIVE` | host-agnostic; applies unchanged |
| E2 | Wilderness problem / hazard beside a colossal relic | `wilderness-problem` · `wilderness-hazard` | `LIVE` | — |
| E3 | Retrieve from a volume only a small body can reach | — | `NO-TABLE-YET` | the site's signature objective. Needs the aperture pair to exist first |
| E4 | Move, free, lure, or provoke the large body | — | `NO-TABLE-YET` | the site's signature lever (spec §7.1) |
| E5 | Butcher / prevent a butchering / salvage | — | `NO-TABLE-YET` | Mode C/D objective |
| E6 | Hoard draw-down surfacing something buried | — | `NO-TABLE-YET` | depends on D3 |
| E7 | Inherited oversize masonry failing on someone | `dungeon-hazard` + integrity state | `LIVE-COMPOSED` | composable from existing hazard rows plus the spec's integrity factor |
| E8 | Small-body infill has blocked the animal's own route | — | `NO-TABLE-YET` | a purely relational situation; nothing models it |
| E9 | Sign of passage at the wrong scale, read as a lead | `wilderness-sign-of-passage` | `LIVE` | already rolls; would gain meaning from a Site 11 destination |

---

## F. States (what can change without repainting the site)

Per spec §6.1. All are runtime facts, not tables — listed so the audit lane can see the state
surface that has to exist.

| # | state | current source | status |
|---|---|---|---|
| F1 | `bodyPresenceState`: absent / expected / present / dead / petrified | occupancy machinery (presence) + `wilderness-feature` (petrified/dead as a rolled object) | `LIVE-COMPOSED` |
| F2 | `apertureState` per portal, with class capacity | `dungeon-door-state` / `dungeon-door-type` carry state but **not body-class capacity** | `TARGET-ADAPTER` |
| F3 | `attendanceState` + shift | — | `NO-TABLE-YET` |
| F4 | `massState`: static / shifting / flowing | — | `NO-TABLE-YET` (see D1–D3) |
| F5 | `accumulationState`: growing / static / being removed | — | `NO-TABLE-YET` |
| F6 | `integrity`: sound / strained / critical / failed | `dungeon-set-dressing-condition` + hazard rows | `LIVE-COMPOSED` |
| F7 | Light ownership (causal light law) | `dungeon-lighting` · `wilderness-lighting-weather` | `LIVE` |

---

## G. The `NO-TABLE-YET` list — the actionable output

Twenty items. Fifteen of them collapse onto two buys.

**Buy 1 — ScaleContract aperture/capacity proof** (closes A7, A8, A9, C12, E3, E4, E8, F3):
one wall assembly carrying two openings with declared body-class capacities, a service run
that provably excludes a 2-cell body, plus the tether/feed mechanism set and the attendance
clock. This is the Golden Seed's first contract proof, not a Site-11-private aperture system.

**Buy 2 — shared `GranularMass` terrain** (closes D1, D2, D3, D9, E6, F4, F5):
a mass with a repose angle, stable and unstable slope bands, an accumulation state, and a
slide rule. Discharges Site 7's outstanding placeholder debt and reaches Sites 5, 3, and 10 as
spoil, rubble, and bulk. Site 11 sponsors and proves the provider; it does not own it.

**Remaining five, not covered by either buy:** A12 (anatomy pieces — Mode C), A13 (pinned
parasitic access — Mode D), B7 (salvagers), B8 (pilgrims), E5 (butchery objectives). All are
Mode C/D, i.e. MVP-and-later per the spec's proposed build order.

**Two adapters, not new tables:** D5 (`Slotted Cover` → the existing cover pipeline) and F2
(body-class capacity onto the existing door/aperture state).

---

## H. What this inventory tells the spawn-audit lane

1. **Site 11 is not content-starved; it is geometry-starved.** 29 of 60 spawnables are `LIVE`
   and rolling today, including all 49 mixed-scale `wilderness-feature` rows with their
   footprints, heights, and tactical effects, and the Dragon Lair / Giant Colony environmental
   tells. What does not exist is anything to render them as.
2. **The engine already wrote the site's tactical grammar.** *Hide inside the mouth · walk
   inside · fight from inside the visor · fingers form multi-level ledges · wings form ramps ·
   acts as a bridge · palm creates an elevated platform · eye sockets act as arrow slits · can
   be run up like a ramp.* Nine authored verbs, all live, none realisable.
3. **One authored cover class is stranded.** `Slotted Cover` exists in table prose with no
   consumer. Any spawn audit should flag it.
4. **Granular hoard is the single largest hole**, and it is shared infrastructure: Site 11
   needs it for its first `GranularMass` stress proof and Site 7 is explicitly borrowing a
   placeholder until it exists.
5. **`room-elevation-profile` row 81–90 (Terraced, 2–3 steps of +1) is the nearest live shape
   to a hoard slope** and is the obvious adapter target — but that table is flagged
   `PROVISIONAL (Adam's draft, ELEV-1)` and its own header says "steps are 5-ft GRID-LAW
   quanta," which needs reconciling against the `h = 2.5 ft` vertical quantum before anything
   is built on it. Flagged, not resolved.
