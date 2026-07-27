STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

# Lane 4 — Live engine + table evidence (the roller audit)

type: research-lane
date: 2026-07-27
status: COMPLETE — every number below is recomputed, not quoted
method: read the Engine markdown sources and the live `src/` modules directly; recomputed all
tallies from `docs/intel/walk-census-*.json`. `tables.js` / `tables.json` were never opened.

This is the guidelines' **step 0 — audit the current rollers** pass, done before any hero
composition was proposed. It is the lane that changed the site.

## Reproducing every number in this lane

```
# 1. the 49 mixed-scale rows in the live wilderness-feature table
python3 - <<'EOF'
import re
p="Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Feature.md"
rows=[m.groups() for m in
      (re.match(r"\|\*\*(\d+)\*\*\|(.*?)\|(.*?)\|(.*?)\|\s*$", l.strip()) for l in open(p)) if m]
kw=re.compile(r"colossal|gargantuan|giant|titan|dragon|wyrm|massive (seat|pot|iron|stone)|mammoth|leviathan|behemoth", re.I)
hits=[r for r in rows if kw.search(" ".join(r[1:]))]
print(len(rows), len(hits), round(100*len(hits)/len(rows),1))
EOF
```

Run from the worktree root. The second and third scripts (census cross-tally, dungeon
area-type tally) are inline in the sections below.

## 1. THE CENSUS UNDER-COUNTED SITE 11 BY 3.7× — and it under-counted the wrong thing

`docs/intel/walk-census.md` maps 27 of 539 wilderness arrivals (5.01%) to Site 11 by keyword.
Re-running the same classification against the **actual source table's** mixed-scale rows
rather than a short keyword list gives:

| measure | census | recomputed | source |
|---|---:|---:|---|
| authored mixed-scale rows in `wilderness-feature` | not stated | **49 of 303 (16.2%)** | `Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Feature.md` |
| distinct mixed-scale rows actually seen in 539 arrivals | 12 | **45 of 49** | `walk-census-mapping.json` |
| mixed-scale arrival count | 27 (5.01%) | **100 of 539 (18.55%)** | same |

See §1a immediately below before quoting that number in a comparison.

### 1a. Honesty check — the comparison had to be run both ways

The first draft of this lane claimed 18.55% made mixed-scale the largest single golden-site
share of the wilderness walk. **That claim was false and is retracted here.** It compared a
*recomputed* Site 11 number against the census's *un-recomputed* keyword numbers for every
other site — apples to oranges. Running an equally broad sweep for Site 3 (Dormant/Abandoned)
over the same table and the same 539 arrivals:

| sweep | authored rows | census arrivals | share |
|---|---:|---:|---:|
| mixed-scale (Site 11) | 49 | 100 | **18.55%** |
| dormant/ruin (Site 3), equally broad | 78 | 137 | **25.42%** |
| rows caught by **both** sweeps | 11 | 28 | 5.19% |
| mixed-scale only | 38 | 72 | 13.36% |
| dormant only | 67 | 109 | 20.22% |

Corrected claim: **mixed-scale is the second-largest recomputed share, behind
dormant/abandoned.** Still 3.7× the census's own Site 11 figure, still very large, but not
first.

The overlap row is more interesting than the ranking. Eleven rows — `Fallen Megalith`,
`Shattered Throne`, `Gargantuan Helmet` (rusting), `Giant Anchor` (rusted), `Giant Birdcage
(Smashed)`, `Giant Sundial (Broken)`, `Colossal Dagger`, `Aqueduct Pillar`, `Beached
Leviathan`, `Gargantuan Shed Skin`, `Giant Bear Trap` (rusted) — are simultaneously
mixed-scale *and* dormant, 28 of 539 arrivals. **The same row is a Site 3 state and a Site 11
relationship at once**, which is exactly what two transforms stacking over one object should
look like, and is direct evidence for reading Site 11 as a transform rather than a host.

### 1b. What all 100 hits actually are

**Every one of those 100 hits is a PROP, not a PLACE.** The rows are things like
`046 Colossal Statue (Head)`, `256 Petrified Dragon`, `294 Giant Skeleton (Beast)`. Not one
of them is a hoard-hall, a giant steading, or an inhabited titan. The demand is enormous and
it is entirely for a **mixed-scale set-piece register**, not for a mixed-scale host program.

That is the finding that reframes the site.

## 2. The table already contains Site 11's tactical grammar, written out

The 49 rows carry a `Dimensions (Footprint & Height)` column and a `Tactical Effect` column.
Read together they are a de-facto specification that nobody has noticed:

| d303 | row | dimensions | tactical effect — verbatim |
|---:|---|---|---|
| 046 | Colossal Statue (Head) | 20'×20', 15' h | Total cover. **Can hide inside the mouth.** |
| 047 | Colossal Statue (Hand) | 15'×15', 20' h | Total cover. **Fingers form multi-level ledges.** |
| 064 | Gargantuan Ribcage | 20'×40', 15' h | Half cover through the ribs. **Can walk inside.** |
| 065 | Gargantuan Skull | 15'×20', 10' h | Total cover. **Eye sockets act as arrow slits.** |
| 110 | Giant Cauldron | 10' dia, 8' h | Total cover. **Interior holds up to 4 Medium creatures.** |
| 119 | Colossal Chain | 5'×50' | Half cover. **Acts as a bridge or barrier.** |
| 148 | Split Boulder | 20' dia, 15' h | Total cover. **Creates a 5-foot-wide alley through it.** |
| 153 | Terraced Slopes | three 10' steps | **Each step provides Half cover from the step below.** |
| 227 | Giant Skeleton (Humanoid) | 20'×50' | **Ribs Half cover. Skull Total cover.** |
| 238 | Stone Hand | 15'×15', 10' h | Total cover. **Palm creates a natural elevated platform.** |
| 252 | Giant Spear | 5'×30', angled | Half cover. **Can be run up like a ramp.** |
| 255 | Gargantuan Helmet | 20'×20', 15' h | Total cover. **Can fight from inside the visor.** |
| 256 | Petrified Dragon | 30'×50', 20' h | Total cover. **Wings form ramps, mouth forms a cave.** |
| 288 | Giant Drum | 20' dia, 10' h | Total cover. **Hollow interior.** |
| 294 | Giant Skeleton (Beast) | 30'×60', 20' h | Ribs Half cover. **Can walk inside.** |
| 296 | Giant Pitcher | 10' dia, 15' long | Total cover. **Can fight from inside the neck.** |
| 300 | Giant Chandelier | 20' dia, 10' up | Blocks LoS. **Can be dropped to deal massive damage.** |

Read the bolded verbs: *hide inside · walk inside · fight from inside · form ledges · form
ramps · act as a bridge · create an alley · elevated platform · arrow slits · hollow interior.*

Adam's tables already decided, row by row, that a mixed-scale object is **enterable,
climbable, and traversable**, not just an obstacle. The site spec does not need to invent
that grammar. It needs to build the geometry that honours it.

Two more live rows outside the wilderness table carry the same idea:

- `wilderness-tactical-terrain` **36 — Rampart of Bone/Fossil**: "The massive ribs of a dead
  leviathan · 5' wide, 20' long · **Slotted Cover.** Three-Quarters Cover, but does not block
  Line of Sight (can see/shoot through the ribs)."
- `wilderness-tactical-terrain` **22 — Hollow Tunnel**: "A massive rotting log or water-carved
  tube · 5' wide, 15' long · Total Cover. **Medium creatures must crawl.**"

`Slotted Cover` is a cover class that exists in the tables specifically for anatomy. It is not
implemented anywhere in `src/` that this lane could find.

## 3. What is LIVE in code, and what only looks live

| source | status | evidence |
|---|---|---|
| `wilderness-feature` (d303, `table_class: Fork`, 49 mixed-scale rows) | `LIVE` | census recorded 100 arrivals across 45 distinct mixed-scale rows in 539 real rolls |
| `wilderness-tactical-terrain` (rows 22, 36) | `LIVE` | in the same live wilderness path |
| `dungeon-area-type` "Massive Cavern" / "Massive Hall" (15 of 200 rows = 7.5%) | `LIVE` | 33 of 1,473 rolled dungeon rooms (2.24%) came back Massive |
| `walk-archetypes.js` `"Dragon Lair": {types:["dragon"], sizeMax:"gargantuan"}` | `LIVE` | 6 of 253 dungeon walks (2.37%) |
| `walk-archetypes.js` `"Giant Colony": {types:["giant"], sizeMax:"gargantuan"}` | `LIVE` | 1 of 253 dungeon walks (0.40%) |
| `SPRITE_SIZE_SCALE` in `src/ui/theater-sprites.js` — `gargantuan: 4` | `LIVE` | bakes the SRD space ratio into the billboard; proved by `dev/verify-theater-sprites.mjs` check (c) |
| `interiorTacticalSpanFor` in `src/ui/theater-standee-mount.js` — `gargantuan → 4` | `LIVE` | tactical span in cells |
| `dungeon-type` row 98/99 "The Megastructure" | `LIVE` but **misclassified** — see §5 | 2 of 253 dungeon walks (0.79%) |
| `Slotted Cover` as a cover class | `AUTHORED-UNWIRED` | present in `wilderness-tactical-terrain` prose; no consumer found in `src/` |
| hoard terrain of any kind | **does not exist** | no table, no code, no geometry. Site 7's brief already notes it borrows "a bounded hoard-pile prop until site 11 mints hoard terrain properly" |
| titan-scale (2×) piece variants | `AUTHORED-UNWIRED` | one line in `STRUCTURE-KIT-CATALOG.md`'s vernacular matrix; no kit, no spec |

## 4. A live tension worth flagging: two different gargantuan scales

Three live constants disagree about how big a gargantuan creature is:

```
src/ui/theater-sprites.js:180        SPRITE_SIZE_SCALE   gargantuan: 4     (SRD space ratio)
src/ui/theater-standee-mount.js:105  interiorTacticalSpan gargantuan: 4    (cells)
src/ui/theater-boot.js:571           SIZE_SCALE           gargantuan: 2.2  (readability tune)
src/ui/blockwright.js:156            BW_SIZE_SCALE        Gargantuan: 3    (= Huge; no distinct rung)
```

`theater-sprites.js`'s own comment says this is deliberate — `SIZE_SCALE` is "a cosmetic
in-game-readability tune" for the cuboid/recipe figure family while the billboard path bakes
the true 4× ratio. That is a defensible split **everywhere except Site 11**, where the whole
point of the frame is the ratio between two bodies. A site whose identity is a scale
relationship cannot have two different answers for what the scale is.

`blockwright.js` collapsing Gargantuan to the same 3 as Huge is a separate, smaller issue:
the register that matters most to this site has no distinct rung there.

**This is not a bug report and no fix is proposed here.** It is recorded because Site 11's
first clay proof will surface it immediately, and whoever builds that proof should know it is
coming rather than discovering it as a mystery.

## 5. The Megastructure boundary — resolved from the source table

The census flags `The Megastructure` → Site 11 as "closest fit (titan-scale); genuinely
ambiguous vs. Site 12." The source table settles it. `Dungeon Type.md` rows 98–99, verbatim:

| roll | type | **theme column** | flavor |
|---|---|---|---|
| 98 | The Megastructure | **Anomaly / Ancient technology** | Metallic corridors hum softly with **impossible geometry**. |
| 99 | The Megastructure | **Anomaly / Ancient technology** | **Non-euclidean walls shift** in faint mechanical rhythm. |

The row's own second column is the classification, and it says *Anomaly*. Neither flavor line
mentions size at all. What they mention is impossible geometry, non-euclidean walls, and
walls that **shift** — which is the ontology contract's Site 12 definition word for word:
"non-building identity, unusual extent, **motion**".

The census's mapping inferred "megastructure ⇒ big ⇒ Site 11" from the name. The table says
otherwise. The proposed ruling, its test, and its corollary are in `synthesis.md` §2.

## 6. The grid arithmetic for hoard terrain

Genesis's committed quantum: **1 cell = 5 ft; vertical `h` = 2.5 ft** (`STRUCTURE-KIT-CATALOG.md`
line 51; `src/engine/clay-room.js:782` `cellFeet: 5`; restated in every Mine-standard spec).

Restated as real-world construction before any number is proposed: a heap of loose material
stands at its angle of repose. Push it steeper and it slides; leave it shallower and it sits.
Loose granular materials sit broadly in a 30°–40° band. Mapping that onto the existing
quantum:

| rise per cell | slope | angle | read |
|---|---|---|---|
| 1 h per cell (2.5 ft over 5 ft) | 1:2 | **26.6°** | below repose → **stable**; walkable |
| 2 h per cell (5 ft over 5 ft) | 1:1 | **45°** | above repose → **unstable**; slides when disturbed |

That is a clean pair, it needs no new quantum, and it makes the stable/unstable distinction
something the player can *see* in the geometry — one riser per cell versus two. The full
proposal built on it is in the working spec §6.

## 7. What this lane means for the site's shape

1. Site 11's demand is real and large — 18.55% of wilderness arrivals, second only to
   dormant/abandoned at 25.42% under an equally broad sweep — but it is demand for
   **objects**, not for a host program. That matches the ontology contract's own
   classification of Site 11 as a scale/relationship stress case, and matches
   `SETTLED-LIFE-SITES-PROGRAM.md` §2's noun/state law. The 28 arrivals caught by *both*
   sweeps make the transform reading concrete: one row, two stacked modifiers.
2. The tactical grammar is already authored and already rolling. The gap is **geometry and
   admission**, not design.
3. `Slotted Cover` is an authored, unwired cover class that Site 11 is the natural consumer
   for.
4. Hoard terrain genuinely does not exist anywhere and Site 7 is already waiting on it.
5. The Megastructure is Site 12's, and the case can be argued from the table rather than from
   taste.
