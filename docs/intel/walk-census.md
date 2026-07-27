# Walk Census — empirical demand curve for the golden-sites program

Repo: `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis` (no commits made; nothing in
this repo was touched — the runner and this report live only in the scratchpad).

## 1. Method — exactly what was rolled

**Total walks rolled and tallied: 1,050**, split across the three walk flavors this engine
actually has, each using a loader pattern copied structurally from the repo's own proven
harnesses (never invented):

| flavor | loader pattern copied from | environments produced | N |
|---|---|---|---|
| **Frontier** (raw topology walk — `rollUrbanWalk`/`rollDungeonWalk`/`rollWildernessWalk` called directly) | `dev/verify-walk.mjs` (`new Function(window, tables.js+walk.js+dungeon-walk.js+wild-walk.js)`) | urban 150, dungeon 150, wilderness 150 | 450 |
| **Travel** (`play.js`'s `explore()` → `travelDepart()`, always wilderness — confirmed in code, `rollWildernessWalk({kind:"travel"})` is its only path) | `dev/verify-travel-walks.mjs` (stub globals + explicit file list, `new Function`) | wilderness 300 | 300 |
| **Job** (`jobPosting()` + `jobWalkAccept()`, envHint rolled uniform urban/wilderness/dungeon) | `dev/verify-job-walks.mjs` (full jsdom + `manifest.json` `loadOrder`) | urban 108, dungeon 103, wilderness 89 | 300 |

- **Script:** `/private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/walk-census.mjs` (rolls + tallies) +
  `walk-census-map.mjs` (second pass: merges each field across flavors and maps to the twelve golden sites; rolls no new dice).
- **Reproduction:**
  ```
  node /private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/walk-census.mjs
  node /private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/walk-census-map.mjs
  ```
  Run from any working directory (both scripts hardcode the absolute repo path). `walk-census.mjs`
  uses the repo's own `node_modules`-free "new Function" pattern for the frontier/travel sections
  and the repo's jsdom install (`~/.genesis-jsdom`, `JSDOM_HOME` override honored) for the job
  section, exactly as `dev/verify-job-walks.mjs` does. Actual run output: `errors: 0` across all
  three sections; `node --version` = v22.15.0 at run time.
- **"Seeds":** this engine has **no PRNG-seed parameter** on any walk roller — `rollUrbanWalk`/
  `rollDungeonWalk`/`rollWildernessWalk` call `Math.random()` directly (confirmed by reading
  `src/engine/walk.js`, `dungeon-walk.js`, `wild-walk.js`; the only `SEED` symbol in the codebase
  is an unrelated per-world save-state field, not an RNG seed). So "many distinct seeds" here means
  **1,050 independent fresh calls**, each drawing its own `Math.random()` entropy — never one long
  continuous stream — which satisfies the spirit of the constraint (no fixed-position assertions,
  distribution-only tallying) without a seed value existing to name. The loop index `i` was used
  only to vary deterministic setup params (tier 1↔2, segCount/legCount 2–11, PC level 1–10 for
  tier-derivation), never as an RNG seed.
- **World setup:** each iteration used a **fresh, disposable world object** (`{id, map:{home node
  only}, characters:[one PC], ...}`, matching each source harness's own `freshWorld`/`mkWorld`
  helper) — no shared mutable state or long-lived world/region across iterations, so no hex-map
  geography was ever established. That has one real consequence, flagged in Caveats: `spiceTier`
  (the region fray tier) came back **100% "baseline"** for every wilderness walk, because
  `spiceTierAt(q,r)` needs real hex coordinates this headless setup never places on a map.

## 2. Tallies

Full raw tallies (every bucket, every distinct value, counts + %) are in
**`walk-census-tally.json`** (the direct roll output) and **`walk-census-mapping.json`** (the
merged/golden-site-mapped second pass) next to this report. Headline tallies below.

### 2a. The three PRIMARY site-kind fields (discovered from code, not guessed)

| environment | field that names "what kind of place this is" | source table | distinct values seen |
|---|---|---|---|
| urban | `walk.setup.type` | `urban-type` | 10 |
| dungeon | `walk.setup.type` | `dungeon-type` | 10 |
| wilderness | arrival segment's `feature.name` (**not** `areaType` — see caveat) | `wilderness-feature` | 255 |

**Urban district (`setup.type`), merged frontier+job, n=258:**

| # | district | count | % |
|---|---|---|---|
| 1 | Entertainment Strip | 33 | 12.79% |
| 2 | Harborfront | 31 | 12.02% |
| 3 | Underworks | 27 | 10.47% |
| 3 | Market Ward | 27 | 10.47% |
| 5 | Civic Center | 26 | 10.08% |
| 6 | Industrial Ward | 25 | 9.69% |
| 7 | Ruined Quarter | 24 | 9.30% |
| 8 | Slums / Low Ward | 23 | 8.91% |
| 8 | Temple Ward | 23 | 8.91% |
| 10 | Noble Quarter | 19 | 7.36% |

Fairly flat — all 10 rows sit within an 8–13% band (a well-balanced table, no dominant district).

**Dungeon overall-type (`setup.type`), merged frontier+job, n=253:**

| # | type | count | % |
|---|---|---|---|
| 1 | Subterranean Crypt | 54 | 21.34% |
| 2 | Natural Cavern | 52 | 20.55% |
| 3 | Military Fortification | 37 | 14.62% |
| 4 | Infrastructure Hub | 35 | 13.83% |
| 5 | Sunken Estate | 26 | 10.28% |
| 6 | Religious Sanctuary | 23 | 9.09% |
| 7 | Prison / Asylum | 11 | 4.35% |
| 8 | Laboratory / Workshop | 10 | 3.95% |
| 9 | The Living Hive | 3 | 1.19% |
| 10 | The Megastructure | 2 | 0.79% |

Much less even — Crypt+Cavern alone are 42% of all dungeon rolls; the last two rows are rare.

**Wilderness arrival feature (`feature.name`), merged frontier+travel+job, n=539, 255 distinct:**
No single value exceeds 6 counts (1.1%) — this table is enormous and richly varied (curiosities,
monuments, wrecks, terrain oddities), the opposite shape of the two tables above. See §3 — most of
these 255 values are not "sites" at all.

### 2b. Occupancy proxy — `threat.id` (who/what is dug in), merged frontier+job

Urban (n=258, 65 distinct — top 3): Necromancer Cells (4.0%), Goliath Stronghold / Dockside
Enforcers / Grave Robber Gang / Shadow Creature Lair / Enchantment Ring / Corrupt Guard / Fey Court
in the City / Religious Fanatic Sect / Foreign Spy Network / Demon Summoning Ring / Street Gang /
Shadow Cult (all 2.3–3.3%, a very long flat tail).

Dungeon (n=253, 29 distinct — top 3): Ooze Outbreak, Gnoll Warband, Risen Dead (each 8–9%), then
Cultist Shrine (~6%), Beast Den / Construct Watch / Vampire Domain (~5% each).

### 2c. Encounter-branch shares — "how much of a walk is pure event, not a site" proxy

Every non-finale segment rolls an encounter branch. Empty/Rumor/Boon carry no site content at all
(pure texture/event); Enemy/Social/Problem/Hazard/Commerce/Spectacle/Discovery/Lore are texture on
top of a place, not the place itself. Merged frontier+job (urban/dungeon) and
frontier+travel+job (wilderness):

| environment | Enemy | Social | Problem | Hazard | Discovery/Lore | Commerce/Spectacle/Boon | Rumor | Empty |
|---|---|---|---|---|---|---|---|---|
| urban (n=1263 segments) | 19.8% | 10.5% | 13.6% | 10.7% | — | 19.1% (Spectacle 7.7+Boon 6.4+Commerce 5.0) | 14.7% | 11.6% |
| dungeon (n=1220 segments) | 24.4% | 11.1% | 20.6% | 15.4% | 13.4% (Discovery) + 5.2% (Lore) | — | — | 10.0% |
| wilderness (n=2112 legs) | 29.0% | 19.0% | 15.8% | 25.8% | 4.6% (Discovery) | — | — | 5.8% |

**Every walk rolled produced at least one classifiable "site kind" label** (urban/dungeon
`setup.type`, wilderness arrival `feature.name`/`areaType`) — the engine stamps these at walk
*assembly* time regardless of what happens along the way, so 0% of the 1,050 walks came back with
literally nothing. The honest finding is downstream of that (§3): the label a wilderness walk gets
is very often not a *buildable* site.

## 3. Golden-site mapping

Twelve golden sites (from `docs/STRUCTURE-KIT-CATALOG.md`'s vernacular matrix, cross-checked
against `docs/GOLDEN-SITES-CATALOG.md`'s status-gate table): 1 Guard Post · 2 Camp/Service ·
3 Dormant/Abandoned · 4 Monastery/Commune · 5 Mine/Workshop · 6 Prison/Institution · 7 Natural Lair
· 8 Infiltrated/Layered · 9 Contested Fortress · 10 Urban Institution · 11 Mixed-Scale/Dragon ·
12 Anomalous/Living/Mobile. Sites 3, 8, 9, 11, 12 are **conditions/modifiers over a host site**
in their own vernacular-matrix definition ("any + condition", "full host kit", "full site-1 kit"),
not independent structural nouns — that matters for reading the table below.

### Urban district → golden site (n=258, exhaustive — all 10 rows mapped explicitly)

| district | count | % | → site | why |
|---|---|---|---|---|
| Market Ward | 27 | 10.5% | 10 Urban Institution | direct — stalls/plaza are named Site 10 pieces |
| Civic Center | 26 | 10.1% | 10 Urban Institution | direct — civic buildings are Site 10's core |
| Temple Ward | 23 | 8.9% | 10 Urban Institution | urban-context religious building (Site 4 is the rural-commune expression of the same vernacular) |
| Noble Quarter | 19 | 7.4% | 10 Urban Institution | civic/residential, loosely covered |
| Industrial Ward | 25 | 9.7% | 5 Mine/Workshop | direct — workshop/forge vernacular |
| Underworks | 27 | 10.5% | 8 Infiltrated/Layered | sewers read as the concealed-layer condition, not a standalone noun |
| Ruined Quarter | 24 | 9.3% | 3 Dormant/Abandoned | direct — "ruined" is exactly the condition |
| **Entertainment Strip** | **33** | **12.8%** | **UNMAPPED** | taverns/theaters/gambling — no golden site names this |
| **Harborfront** | **31** | **12.0%** | **UNMAPPED** | docks/harbor infra — adjacent to Site 10 but not in its brief |
| **Slums / Low Ward** | **23** | **8.9%** | **UNMAPPED** | poverty district — no named vernacular |

**Urban: 171/258 (66.3%) mapped, 87/258 (33.7%) unmapped.** The two biggest single unmapped
buckets (Entertainment Strip, Harborfront — 24.8% combined) are the single largest urban district
overall, bigger than any one mapped district.

### Dungeon overall-type → golden site (n=253, exhaustive — all 10 rows mapped explicitly)

| type | count | % | → site | why |
|---|---|---|---|---|
| Subterranean Crypt | 54 | 21.3% | 3 Dormant/Abandoned | funerary/tomb reads as the abandoned/condition family |
| Natural Cavern | 52 | 20.6% | 7 Natural Lair | direct — "natural" is Site 7's own vernacular word |
| Military Fortification | 37 | 14.6% | 9 Contested Fortress | military-masonry family (Site 1 Guard Post is the small end of the same vernacular) |
| Sunken Estate | 26 | 10.3% | 3 Dormant/Abandoned | flooded/collapsed manor — abandoned/condition family |
| Religious Sanctuary | 23 | 9.1% | 4 Monastery/Commune | direct |
| Prison / Asylum | 11 | 4.3% | 6 Prison/Institution | direct |
| Laboratory / Workshop | 10 | 4.0% | 5 Mine/Workshop | direct |
| The Living Hive | 3 | 1.2% | 12 Anomalous/Living/Mobile | direct — explicitly a living structure |
| The Megastructure | 2 | 0.8% | 11 Mixed-Scale/Dragon | closest fit (titan-scale); genuinely ambiguous vs. Site 12 |
| **Infrastructure Hub** | **35** | **13.8%** | **UNMAPPED** | aqueduct/utility hub — adjacent to Site 5's excavated vernacular but functionally a city-utility space, not extraction/craft |

**Dungeon: 218/253 (86.2%) mapped, 35/253 (13.8%) unmapped.** Dungeons map far better than urban
or wilderness — the `dungeon-type` table's own vocabulary already leans architectural
(Crypt/Cavern/Fortification/Sanctuary/Prison/Workshop), which happens to overlap the golden-site
list closely. The one real gap (Infrastructure Hub, 13.8%) is a genuine, sizeable miss.

### Wilderness arrival feature → golden site (n=539, 255 distinct — keyword-classified, disclosed method)

Classified by matching each rolled feature name/description against the twelve golden sites'
vernacular words (from `STRUCTURE-KIT-CATALOG.md`'s own vocabulary — watchtower/garrison→Guard
Post, camp/tent/wagon→Camp, shrine/temple/monastery→Monastery, mill/forge/mine→Mine-Workshop,
prison/gaol→Prison, den/lair/burrow/hive→Natural Lair, fortress/keep/citadel→Contested Fortress,
market/guildhall→Urban Institution, dragon/hoard/titan→Mixed-Scale, living/sentient→Anomalous,
ruin/collapsed/sarcophagus/barrow→Dormant/Abandoned). This is a **disclosed heuristic**, not a
founder ruling — every underlying count is a real roll, the classification is mine.

**Mapped: 177/539 (32.8%). Unmapped/not-a-site: 362/539 (67.2%).**

| golden site (of the mapped 177) | count |
|---|---|
| 3 Dormant / Abandoned (+5 funerary) | 55 |
| 4 Monastery / Commune | 30 |
| 11 Mixed-Scale / Dragon | 27 |
| 5 Mine / Workshop | 14 |
| 1 Guard Post | 15 |
| 2 Camp / Service | 12 |
| 7 Natural Lair | 11 |
| 6 Prison / Institution | 9 |
| 10 Urban Institution | 4 |

**Top 20 UNMAPPED wilderness features, verbatim, with counts** (out of 255 distinct unmapped
values, most appearing 1–6 times each — this table is huge and no single curiosity repeats often):

```
6  Iron Pillar: Rusting cylinder humming faintly.
6  Crystal Geode: Smashed open, revealing jagged interior.
6  Bone Pile: A massive mound of bleached humanoid bones.
5  Grandfather Clock: Ticking loudly, perfectly clean.
5  Lone Boulder: A massive, unmovable rock.
5  Plush Carpet: An incredibly long red runner unrolled in the dirt.
5  Giant Anchor: Rusted iron hook the size of a house.
5  Giant Bear Trap: A 15-foot wide rusted iron jaw mechanism.
5  Terraced Slopes: Earth naturally shaped like giant stairs.
5  Towering Mesa: Steep-sided, flat-topped earth pillar.
4  Crumbling Corner: Two walls meeting at a 90-degree angle.
4  Balanced Rock: Massive boulder on a tiny pedestal.
4  Oasis / Hot Spring: A small pool of perfectly clear water.
4  Floating Weapon: A normal longsword, frozen 20 feet in the air.
4  Singing Crystals: Shards of quartz that hum in the wind.
4  Floating Rock Steps: 1d4+1 stones hovering like stairs.
4  Whirlpool / Siphon: Water actively draining underground.
4  Tangled Briar Patch: A dense knot of sharp wood.
4  Bramble Wall: Impassable thicket of thorns.
4  Ghost Ship: An illusion of a ship that loops a 5-sec crash.
```

The full 362-count / 255-distinct unmapped list is in `walk-census-mapping.json` →
`goldenSiteMapping.wildMapped.rows` (filter `site: null`). Reading the pattern: this table is a
**landscape curiosities/monuments generator** (single objects, wrecks, natural oddities, illusions)
— it is not, and was never meant to be, a generator of the twelve buildable golden-site structures.
That is the single biggest coverage-gap finding in this census.

### Overall top-5 place-kind headline (all three primary fields pooled, n=1050)

| # | place kind | environment | count | % of 1050 |
|---|---|---|---|---|
| 1 | Subterranean Crypt | dungeon overall-type | 54 | 5.14% |
| 2 | Natural Cavern | dungeon overall-type | 52 | 4.95% |
| 3 | Military Fortification | dungeon overall-type | 37 | 3.52% |
| 4 | Infrastructure Hub | dungeon overall-type | 35 | 3.33% |
| 5 | Entertainment Strip | urban district | 33 | 3.14% |

(Wilderness's own 255-value feature table is so fragmented no single value cracks the top 30 of
this pooled ranking — its own internal top value, "Iron Pillar"/"Crystal Geode"/"Bone Pile" at 6
counts / 1.1% each, sits well down the list. That fragmentation is itself the finding, not a
ranking artifact.)

## 4. Caveats — what this census could NOT see

1. **Wilderness has no `setup.type` table the way urban/dungeon do.** Its `areaType` field (which
   this task's orientation might reasonably guess is the site-kind analog) turned out on inspection
   to be a **physical clearing shape/dimensions string** ("60' x 80' Kidney Shape", "40' x 40'
   U-Turn") — not a site name at all. The actual site-kind signal is the arrival's `feature.name`
   (the `wilderness-feature` table). This was discovered empirically by rolling and reading real
   output, not assumed from the field name.
2. **Dungeon per-room `areaType`** (Corridor/Chamber/Rotunda/Cave/Octagon, 111 distinct across 150
   dungeons) is **room shape**, not the dungeon's site identity — that identity lives one level up,
   on `walk.setup.type`. Room shapes were tallied (`roomAreaTally` in the JSON) but are structural
   §10.3-coverage data, not golden-site demand.
3. **No hex/region geography was modeled**, so `spiceTier` (baseline/fray1/fray2/rim) came back
   100% "baseline" for every wilderness walk in this census — the fray-distance calculation needs a
   placed node position on a live map, which these disposable single-node worlds never establish.
   Spice **band** (Grounded/Textured/Strange/Volatile/Mythic) is stamped per individual table roll
   (visible in each segment's `rollRefs`), not once per walk, so a clean "walk-level spice band"
   tally isn't a real field this engine has — reported per-roll bands (`areaBandTally`) instead
   where available (dungeon room area rolls, wilderness arrival area rolls).
4. **Site interiors are not decided at walk-roll time for any environment.** A dungeon room, an
   urban segment, and a wilderness arrival all carry surface dressing/feature/lighting rolls, but
   none of the three walk objects contain room-by-room *furnished interior* data — that's a later
   synthesis-pass/theater-rendering concern (`docs/SYNTHESIS-CONTRACT.md`, `docs/WALK-CARD-DEALING.md`),
   downstream of what a walk roll itself produces. This census only sees what the walk objects
   themselves carry.
5. **The wilderness golden-site mapping is a disclosed keyword heuristic**, not a founder ruling —
   reasonable people could reclassify a handful of the 177 mapped rows (e.g. "The Megastructure" →
   Site 11 vs. Site 12 is flagged ambiguous in the table itself). The underlying counts are exact;
   the site label attached to each is my classification.
6. **Job-walk urban postings never leave the current node** (confirmed in `job-walks.js`) — an
   in-town job's "site" is really the abstract urban-type walk assembled for it, not a new place on
   the map. That's counted the same as any other urban walk here, which is correct per the engine's
   own model, but worth knowing when reading "job → urban" numbers as if they were new locations.
7. Two harness runs (`verify-walk.mjs`-style and `verify-travel-walks.mjs`-style loaders) ran
   independently of the jsdom job-walk loader; all three reported `errors: 0` in this run, but
   because Math.random() is real (unseeded) entropy, re-running will reproduce the same **shape**
   of distribution, not the same exact counts — consistent with the KNOWN CONSTRAINT this task
   named.
