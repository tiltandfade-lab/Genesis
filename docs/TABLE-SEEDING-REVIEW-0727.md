---
type: founder-review
project: Genesis
status: AWAITING ADAM'S REVIEW
created: 2026-07-27
branch: feat/spawn-audit-seeding
related:
  - "[[TABLE-EDIT-SAFETY]]"
  - "[[TABLE-ROW-CONTRACT]]"
  - "[[SPICE-CURVE]]"
  - "[[GOLDEN-SITES-CATALOG]]"
---

# Table Seeding Review — 2026-07-27 spawn audit

**Adam, this is the sheet you asked for:** *"any table edits you make, or any tables you create I
would like to see them and be able to review them, give me sample rows of each including each tier
of spice that you implement across the board."*

Everything below is already applied on `feat/spawn-audit-seeding` and gated. Nothing is merged.
Every seeded row is quoted verbatim. Every table also shows one or two of **your existing rows** as
calibration, so you can judge the new ones against the register they landed in rather than in a
vacuum.

## The laws this pass held to

- **Additive only.** No existing row's text, band, or roll range was modified or deleted anywhere.
  Two proposals that would have required renumbering existing rows were **not applied** — they are
  in the skipped log at the bottom with their full text, ready for your hand.
- **Archive before edit.** Every touched table markdown file was copied, unmodified, into an
  `Archive/` folder beside it as `<Name>.2026-07-27.md` before the first edit. `compile-tables.py`
  and `lint-tables.py` both skip `/Archive`, so the snapshots are inert.
- **Edit source, compile artifact.** All edits are to Engine markdown (or to the hand-authored
  `data/*.js` sources); `tables.json` / `tables.js` were regenerated, never hand-touched.
- **Companions land in the same change.** Where a new row would have mis-rendered without a
  matching entry in a hand-authored JS map, that entry was added in this same unit (three cases,
  §7).
- **No new tables were created.** Every edit is rows appended to a table you already have.

## 1. At a glance

| # | table | file | die change | rows added | banded? |
|---|---|---|---|---:|---|
| 1 | `wilderness-feature` | `Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Feature.md` | d303 → **d317** | 14 | no |
| 2 | `wilderness-encounter-type` | `…/Dungeons/Wilderness Encounter Type.md` | d20 → **d24** | 4 | no |
| 3 | `wilderness-area-type` | `…/Dungeons/Wilderness Area Type.md` | d300 → **d312** | 12 | no |
| 4 | `wilderness-biome-type` | `…/Dungeons/Wilderness Biome Type.md` | d10 → **d11** | 1 | no |
| 5 | `walk-skin-wilderness` | `Engine/03. _Tables/03. Session Mechanics/Walk Skin - Wilderness.md` | d100 → **d101** | 1 | **YES** |
| 6 | `building-interior` | `Engine/03. _Tables/01. World Building/Place Generation/Building Interior.md` | d300 → **d301** | 1 | **YES** |
| 7 | `urban-type` | `…/Dungeons/Urban Type.md` | d100 → **d110** | 10 | no |
| 8 | `dungeon-type` | `…/Dungeons/Dungeon Type.md` | d100 → **d112** | 12 | no |
| 9 | `dungeon-area-type` | `…/Dungeons/Dungeon Area Type.md` | d200 → **d215** | 15 | no |
| 10 | `dungeon-feature` | `…/Dungeons/Dungeon Feature.md` | d153 → **d169** | 16 | no |
| 11 | `dungeon-threat-identity-t1` | `…/Dungeons/Dungeon Threat Identity T1.md` | d30 → **d33** | 3 | no |
| 12 | `dungeon-threat-identity-t2` | `…/Dungeons/Dungeon Threat Identity T2.md` | d45 → **d48** | 3 | no |
| 13 | `urban-threat-identity-t1` | `…/Dungeons/Urban Threat Identity T1.md` | d30 → **d32** | 2 | no |
| 14 | `urban-threat-identity-t2` | `…/Dungeons/Urban Threat Identity T2.md` | d50 → **d52** | 2 | no |
| 15 | `faction-basic` | `Engine/03. _Tables/02. Social/Factions/Faction - Basic.md` | d100 → **d105** | 5 | **YES** |
| 16 | `urban-interactable-object` | `…/Dungeons/Urban Interactable Object.md` | d300 → **d301** | 1 | no |
| 17 | `urban-set-dressing` | `…/Dungeons/Urban Set Dressing.md` | d105 → **d106** | 1 | no |
| 18 | `wilderness-set-dressing` | `…/Dungeons/Wilderness Set Dressing.md` | d305 → **d307** | 2 | no |
| 19 | `T.faction` (world genesis) | `data/world-tables.js` | die 100 → **105** | 5 | **YES** |
| 20 | `T.arch` (world genesis) | `data/world-tables.js` | die 100 → **101** | 1 | **YES** |

**111 rows across 20 tables.** 13 of them carry a real Band cell; the other 98 are on tables that
have no Band column at all (see §2's honesty note).

## 2. The spice ladder — every banded seeded row, by tier

This is the "each tier of spice across the board" cut. **Read this section first if you read
nothing else.**

**Honest caveat up front:** only 5 of the 20 touched tables carry a real `Band` column
(`walk-skin-wilderness`, `building-interior`, `faction-basic`, `T.arch`, `T.faction`). The other 15
are `Fork`/`Spark` catalogue tables with no per-row spice grading at all — there are no proportions
to preserve there, only a class ceiling to respect, and every row added to them sits at or below
that ceiling. **No Band column was invented for any table**; that would have been a schema change
touching every existing row.

### Grounded
No Grounded rows were seeded onto a banded table. The three Grounded rows the urban analyst wrote
(dwelling bottom rung, warren stairwell, quay customs post) are in the **skipped log, §8-A** — they
would have required renumbering 102 of your existing `building-interior` rows.

### Textured / Strange
None seeded onto a banded table this pass. The evidenced gaps at these tiers all landed on unbanded
catalogue tables (§3–§6).

### Volatile — 8 rows (4 in the markdown source, the same 4 mirrored into the live JS)

`faction-basic` + `T.faction` (`data/world-tables.js`), rows 101–104. This axis had **no Volatile
and no Mythic row at all** (80/15/5/0/0) — the one table that answers "what KIND of power holds a
place" could not produce a world-marking occupier.

> **101 · Volatile · The Keeper-House Compact** — A confederation of named jailers and wardens who
> have quietly agreed that no prisoner crosses a border without their sealed word — and who now hold
> half the region's disputed captives hostage to enforce it.

> **102 · Volatile · The Ledger-and-Shift Assembly** — A faceless bureaucracy of clerks, guards, and
> record-keepers that has outlived six governments by controlling who is legally a person — and who
> has just been struck from the rolls entirely.

> **103 · Volatile · The Strike-Line Compact** — A cross-mine alliance of laborers and foremen who
> shut down three claims at once and are only now learning, together, how much of the region's
> wealth actually runs through their hands.

> **104 · Volatile · The Guest-Fire Council** — An alliance of displaced camps, shanty quarters, and
> borrowed ground who have started keeping their own ledger of every host who took them in — and
> every one who didn't.

### Mythic — 5 rows, one per banded table. This is where "spicy is very spicy" got spent.

> **`faction-basic` / `T.faction` 105 · Mythic · The Sentence That Walks** — No one founded it; a
> single verdict, spoken three centuries ago against a name history no longer remembers, was never
> lifted — and the punishment kept convicting whoever stood nearest to enforce it, generation after
> generation, until the office of "warden" and the crime of "guilty" became the same hereditary
> post. Today it holds no fixed prison, no fixed judge, and no fixed criminal — only a rotating
> population of the accused, the accusers, and the accidentally adjacent — and it has just, for the
> first time anyone living remembers, found someone to declare innocent.

> **`T.arch` 101 · Mythic · Tideglass** — Walls of fused salt-glass that turn to seawater at high
> tide and remember their shape at low — for six hours of every day, the town has no walls at all.

> **`walk-skin-wilderness` 101 · Mythic · Something denned here before the world had a name for
> it.** — The claimed floor beneath the broken ledge is scaled to a body no living species matches —
> bones set in the walls like reinforcement, still faintly warm, and every animal that enters gives
> it the same wide, permanent berth the forest itself seems to have agreed on generations ago.
> *(Grants `relic`, Motif `bone`.)*

> **`building-interior` 301 · Mythic** — *Layout:* The warren has no oldest street. Walk it end to
> end and every resident points to a different lane as the first one ever built — and every lane has
> proof: a cornerstone dated in an old hand, a grandmother buried under the threshold, a door that
> has always, always been that color. · *Notable Feature:* The town's own founding charter,
> consulted on the spot, agrees with whichever lane you asked about last. · *Who/What Is Inside:* An
> old woman resetting a single loose cobblestone that she has reset, she says without any doubt at
> all, every day of her life and her mother's life before her — and the stone is always the first
> stone.

> **(annotation-only Mythic)** — `dungeon-type` 104/107/112, `dungeon-area-type` 215, and
> `dungeon-feature` 167/168 read as Mythic but those three tables have **no Band column**, so
> nothing was written into a band cell. They are quoted in §5 and flagged in §8-D.

**Band math for the four banded tables, existing rows untouched:**

| table | before | after | Δ on the top band |
|---|---|---|---|
| `walk-skin-wilderness` | 66/20/9/4/1 of d100 (Mythic 1.00%) | 66/20/9/4/**2** of d101 (Mythic **1.98%**) | +0.98 pt |
| `building-interior` | 198/60/27/12/3 of d300 (Mythic 1.00%) | 198/60/27/12/**4** of d301 (Mythic **1.33%**) | +0.33 pt |
| `faction-basic` / `T.faction` | 80/15/5/**0/0** of d100 | 80/15/5/**4/1** of d105 (Volatile 3.8%, Mythic 0.95%) | Volatile:Mythic held at the corpus's 4:1 tail convention |
| `T.arch` | 66/20/9/4/1 of d100 (Mythic 1.00%) | 66/20/9/4/**2** of d101 (Mythic **1.98%**) | +0.98 pt |

Every non-top band moves by less than 1 percentage point (pure denominator dilution — no existing
row's count changed). The `building-interior` Mythic bump 1.00% → 1.33% is the one deliberate
departure from proportionality in the whole pass, made on your "spicy is very spicy" direction.

---

## 3. Wilderness family

### 3.1 `wilderness-feature` — d303 → **d317**, 14 rows (304–315 + 316–317)

*No Band column. `table_class: Fork` (ceiling Strange); every row is physical, none breaks reality.
Rolled on every wilderness leg's arrival AND on every Discovery branch.*

**Why:** grepping all 303 rows for Site 7's own vocabulary returned `lair` 0, `burrow` 0, `hoard` 0,
`warren` 0, `scat` 0 — the walk census's 2.0% Natural-Lair mapping rate was a content fact, not a
sampling artifact.

**EXISTING (calibration, verbatim):**

```
|**062**|**Fossilized Tree:** Giant tree turned entirely to stone.|10' diameter, 40' high|Total cover.|
|**150**|**Hollow Rock:** A boulder with a cave-like interior.|15' diameter, 10' high|Total cover. Interior holds up to 3 Medium creatures.|
```

**SEEDED (verbatim) — rows 304–315, the Site 7 occupied-lair set:**

```
|**304**|**Weeping Den Mouth:** A low limestone slit exhaling cold, wet-earth air; clawed grooves flank the opening.|5' wide, 4' high mouth, 15' interior depth|Choke point. DC 12 Perception at the threshold reveals fresh bedding and gnawed bone inside.|
|**305**|**Burrower's Warren:** A raw earthen shaft, walls smoothed by claw and belly, a spoil-mound heaped at the lip.|4' diameter shaft, 6' high spoil mound|Difficult terrain climbing the mound. The shaft narrows — Medium creatures must squeeze past the first bend.|
|**306**|**Root-Hollow Maw:** A living tree's roots have grown around and swallowed a cavity, bark scarred smooth at the entrance from repeated passage.|8'x8' root-frame mouth, 10' high|Total cover at the frame. The hollow beyond breathes faint warm air — something denned here recently.|
|**307**|**Drowned Sink:** A dark pool feeds down into a submerged throat; ripples move against the current every few minutes.|15' diameter pool, unknown depth|Hazard: DC 13 Strength save to resist the pull toward the siphon. Something surfaces and submerges on its own schedule.|
|**308**|**Feral Adit:** An old mine's timber-shored entrance, props rotted and reset crookedly with fresh branches — something has moved back in.|6' wide, 7' high, 20' visible interior|Total cover. Old rail ties are Difficult Terrain; fresh territorial marks overlay the worked stone.|
|**309**|**Twin-Throat Hollow:** Two mouths in the same outcrop, one wide and trampled, one narrow and clean — the den has more than one door.|Two mouths, 8' and 3' wide, 12' apart|Choke point at the narrow throat. The wide mouth offers no cover; the narrow one grants Half cover to a squeezing creature.|
|**310**|**Overlook Den:** A broken shelf of rock juts above a shadowed mouth below, littered with cracked long-bones dragged up for the view.|10'x10' shelf, 8' above the mouth|Grants elevation. DC 10 Athletics or a rough-climb route reaches the shelf; the mouth below is Total cover from it.|
|**311**|**Sagging Warren Roof:** A burrow's ceiling has slumped, roots and soil hanging low over a half-collapsed den mouth.|10'x10' footprint, 4' clearance|Difficult terrain (stooping). Hazard: DC 12 Dexterity save or the roof sheds another fall of soil (loud) when forced.|
|**312**|**Abandoned Nest-Ring:** A ring of flattened bracken and old down feathers, the mouth behind it cold and undefended.|15' diameter nest ring, mouth 6' beyond|Half cover from the ring's berm. No current occupant sign — tracks lead away, not in.|
|**313**|**Bone-Marked Threshold:** Sun-bleached ribs and skulls staked upright flank a dark opening, spaced with deliberate care.|10' wide marked approach, mouth 4'x4'|Half cover behind each stake. The marking pattern suggests territory, not decoration — DC 13 Nature identifies the species by bite-spacing.|
|**314**|**Steam-Throat Vent:** A fissure breathes warm sulfurous air in slow tides, matching something's breathing rhythm deeper in.|5' wide vent, depth unknown|Heavily obscures 10' radius on the exhale. The rhythm is too regular to be geology alone.|
|**315**|**Torn-Wide Maw:** A den mouth ripped far larger than any natural process explains, claw-gouges scoring both sides shoulder-high and higher.|15' wide, 12' high mouth|Total cover. The gouge height alone rules out anything Medium-sized.|
```

Coverage map: 304 karst small den · 305 dug/burrower · 306 grown/organic · 307 flooded/siphon ·
308 adopted feral mine · 309 large pocket (two mouths) · 310 **the deck** (broken shelf) · 311
hazard edge · 312 empty/displaced hook · 313 territory claim · 314 volcanic origin · 315
large-body/excavator envelope.

**SEEDED (verbatim) — rows 316–317, the route-denial pair (from the dressing family):**

```
|**316**|**Chevaux-de-Frise Barrier:** A portable X-framed timber barrier bristling with iron-tipped spikes, staged across the trail.|8' wide, 4' high|Half cover; costs 10 extra feet of movement to cross. DC 12 Dexterity (Acrobatics) crossing at speed or take 1d4 Piercing.|
|**317**|**Gabion Revetment:** A run of stone-packed wicker baskets shoring a bank, wall foot, or breach.|10' long, 3' high|Half cover. A basket cut open (10 slashing damage) spills its stone and opens a gap.|
```

> **Deviation, disclosed:** the dressing analyst proposed these as rows 304–305. The wilderness
> analyst had already claimed 304–315 on the same table. Serial application gave them the next free
> numbers, 316–317. Text unchanged.

### 3.2 `wilderness-encounter-type` — d20 → **d24**, 4 rows

*No Band column. Categorical weighting is by row repetition — the table's own convention (Trap ×3,
Social ×4, Hazard ×5, Enemy ×6). The four new rows follow that exact pattern.*

**EXISTING (calibration, verbatim):**

```
|**1**|**Empty / Atmospheric Break**|**No immediate threat.** The party enters a uniquely atmospheric zone. Roll on the **Sensory** and **Sign of Passage** tables. Used to build tension or foreshadow future threats without draining resources.|
|**9**|**Discovery / Monument (Art)**|**Lore and exploration.** The party finds something permanent and remarkable. Roll on the **Landmark / Feature** and **Set Dressing** tables. May contain hidden clues or harvestable flora.|
```

**SEEDED (verbatim) — rows 21, 22, 23, 24, identical text ×4:**

```
|**21**|**Discovery / Occupied Lair**|**A claimed den, not empty ground.** The party finds a mouth, burrow, or hollow with fresh occupant sign. Roll on the **Landmark / Feature** table for the specific mouth and claim. Investigation and reading the sign, not automatic combat.|
```

The word "Discovery" is deliberate: `wwalkEncounter()` dispatches by substring, so these fall
straight into the existing `Discovery`/`Monument` branch that already rolls `wilderness-feature` —
the table §3.1 just filled. **Zero engine changes were needed.**

**Proportion shift (every existing category's raw row count untouched; only the denominator grew):**

| category | before ÷20 | after ÷24 |
|---|---|---|
| Empty/Atmospheric | 1 → 5.00% | 1 → 4.17% |
| Trap/Barrier | 3 → 15.00% | 3 → 12.50% |
| Social/Interaction | 4 → 20.00% | 4 → 16.67% |
| **Discovery (Monument + Occupied Lair)** | 1 → 5.00% | **5 → 20.83%** |
| Hazard/Obstacle | 5 → 25.00% | 5 → 20.83% |
| Enemy/Combat | 6 → 30.00% | 6 → 25.00% |

**This is the single biggest behavioral change in the pass.** Discovery goes from the rarest branch
to the second-most-common. If you want it smaller, cut rows 23–24 and it becomes 3/22 = 13.6%.

### 3.3 `wilderness-area-type` — d300 → **d312**, 12 rows

*No Band column. The table cycles 6 "Walls" archetypes across 50 shapes; a chasm/drop boundary was
not one of the six, so Site 7's canonical deck (a broken ledge overlooking a claimed floor) could
never be generated as the clearing's own boundary — only as decorative props elsewhere.*

**EXISTING (calibration, verbatim):**

```
|**005**|20' x 20' Square Clearing|20-foot high sheer rock / ice cliffs.|Dead end; a 5'x5' elevated ledge sits 10 feet up the back wall.|
|**037**|50' x 80' Large Valley|Impassable thorny brush / razor-sharp coral.|20' wide main path; 20'x20' secondary clearing attached by a 5' squeeze.|
```

**SEEDED (verbatim) — rows 301–312, one new wall archetype across 12 of the 50 shapes:**

```
|**301**|20' x 20' Square Clearing|Broken chasm rim / unseen drop into dark below.|A 5' wide natural ledge rings the near edge; the far rim is unreachable without a climb or a jump.|
|**302**|30' x 30' Square Clearing|Broken chasm rim / unseen drop into dark below.|10' wide entrance path; a broken shelf 10' down the near wall offers a landing before the true bottom.|
|**303**|50' x 80' Large Valley|Broken chasm rim / unseen drop into dark below.|20' wide main path hugs the rim; a rubble-crowned ledge juts out over the drop, wide enough to stand and fight from.|
|**304**|30' Diameter Circle|Broken chasm rim / unseen drop into dark below.|10' wide entrance; the center third of the circle has given way entirely — a true void, not difficult terrain.|
|**305**|60' x 60' Octagon|Broken chasm rim / unseen drop into dark below.|20' wide path in; a terraced shelf at each cardinal point offers cover and elevation over the central drop.|
|**306**|20' x 60' Narrow Gorge|Broken chasm rim / unseen drop into dark below.|The gorge floor has partly collapsed; a 5' wide ledge continues along one wall where the true floor does not.|
|**307**|40' x 60' Trapezoid|Broken chasm rim / unseen drop into dark below.|20' wide entrance at the wide end narrows toward a sheer unrailed drop at the point.|
|**308**|60' x 80' Oval Valley|Broken chasm rim / unseen drop into dark below.|20' wide paths on opposite ends; a broken shelf runs the long axis, 10' above a floor that never fully resolves in the dark.|
|**309**|50' x 50' T-Junction (20' wide)|Broken chasm rim / unseen drop into dark below.|10' wide paths at all three ends; the stem overlooks the drop from a natural balcony rather than crossing it.|
|**310**|40' x 40' Diamond|Broken chasm rim / unseen drop into dark below.|10' wide paths at opposite points; the center has fallen away, leaving two facing ledges rather than a floor.|
|**311**|30' x 50' Crescent Moon|Broken chasm rim / unseen drop into dark below.|10' wide paths at both tips; the inner curve is a continuous broken shelf overlooking the void at its center.|
|**312**|60' x 80' Kidney Shape|Broken chasm rim / unseen drop into dark below.|20' wide paths at both ends; a wide natural deck occupies the shape's waist, the only solid ground over the drop below.|
```

> **Honest partial:** 12 shapes, not all 50 — the analyst deliberately did not mechanically
> grid-complete a 7th wall archetype you never asked for. If you want the full 7×50 grid that is
> another 38 rows and your call.

### 3.4 `wilderness-biome-type` — d10 → **d11**, 1 row · **companion applied**

**EXISTING (calibration, verbatim):**

```
|**7**|**Mountain**|Soaring peaks, treacherous passes, and alpine cliffs.|
|**9**|**Deeplands**|Subterranean caverns, sunless seas, and echoing tunnels.|
```

**SEEDED (verbatim):**

```
|**11**|**Fey-Bent Hollow**|A pocket of forest where the season, gravity, or light no longer quite agrees with the land around it.|
```

**Founder taste call, flagged not resolved:** one row on a d10→d11 table is **9.09%** of all
per-leg biome rolls. The sibling `travel-biome` allocates 3.0% to its Oddball biomes. d10
granularity cannot land closer to 3% with a whole row. You may prefer this table stay 100% mundane.
Cutting it is a one-line revert.

**REQUIRED COMPANION — applied in the same change** (`src/engine/theater-data.js`): a biome word
with no entry in `THEATER_FLOOR_BIOME_MAP` and `BIOME_DRESSING` renders forever as generic
cracked-earth. That exact bug already happened once on this map (its own in-code note documents
`Deeplands`/`Underwater` silently falling through). Both objects gained a `"Fey-Bent Hollow"` entry:
floor `leaf-litter`, advisory light bias `moonlit`, and a four-slug scatter pool drawn only from art
that already ships in `assets/dressing/` (birchgrove, mossboulder, wildflowerpatch, nightshade). No
new art.

### 3.5 `walk-skin-wilderness` — d100 → **d101**, 1 Mythic row · **the one properly banded wilderness table**

**EXISTING (calibration, verbatim — one per band; ★ = your approved anchor rows):**

```
| 1 | Grounded | **Late-season rot.** ★ | Every deadfall is soft, every ford swollen; the trail knows it's October. (Footing rolls where there was footing; smells of wet bark and mushroom.) |  | none |
| 67 | Textured | **A hunting culture passed through.** ★ | Blazes cut chest-high, drying racks, a shrine of stacked antlers — someone claims this ground and counts what crosses it. | faction-mark,threat-bias:hunter | bone |
| 87 | Strange | **The birdsong is wrong.** ★ | Every call is answered a half-second late, from the wrong direction, one octave low. Nothing else seems to notice. |  | void |
| 96 | Volatile | **The canopy is burning, slowly, miles off.** ★ | Ash falls like gray snow; everything alive is moving the same direction you are, and none of it is fighting each other yet. | clock,hazard-suffuse | fire |
| 100 | Mythic | **The forest remembers being an ocean.** ★ | Fish-shadows school between the trunks at dusk; drowned bells toll from under the roots; things surface. | relic | flood |
```

**SEEDED (verbatim) — row 101, Mythic:**

```
| 101 | Mythic | **Something denned here before the world had a name for it.** | The claimed floor beneath the broken ledge is scaled to a body no living species matches — bones set in the walls like reinforcement, still faintly warm, and every animal that enters gives it the same wide, permanent berth the forest itself seems to have agreed on generations ago. | relic | bone |
```

Grants/Motif follow the table's own convention (row 100 carries `relic`/`flood`; this carries
`relic`/`bone`). The preamble's own count line was updated from "1 Mythic" to "2 Mythic" so the
document doesn't lie about itself.

> **Disclosed deviation:** exact-proportion preservation would have required doubling the whole
> table to d200 (132/40/18/8/2). That means inventing ~65 Grounded, 19 Textured, 8 Strange and 3
> Volatile rows against no evidenced gap — manufacturing volume to satisfy a formula. One row was
> added instead; every band moves ≤1 pt.

---

## 4. Urban family

### 4.1 `building-interior` — d300 → **d301**, 1 Mythic row

**EXISTING (calibration, verbatim — one or two per band):**

```
| 1 | Grounded | A front room, a back room, a ladder to a sleeping loft. | A hearth banked low, a kettle still warm on the hook. | An old woman who was plainly expecting someone else. |
| 91 | Grounded | Poor but tidy single-room dwelling with a loft. | A single letter propped against the wall where a family would put a shrine. | No one inside. A fire has burned down but the door was latched from the outside. |
| 203 | Textured | A warehouse where the interior is longer than the street frontage allows. | Shelves at the far end stocked with goods that have no delivery record and no manifest. | A warehouseman at the near end who says he hasn't been to the far end in a while. |
| 259 | Strange | A hallway longer than the building is wide from the street. | Every clock in the house stopped at the same minute. | A child who answers the question you were about to ask. |
| 287 | Volatile | A townhouse where the top floor is on fire, burning steadily but not spreading, and has been since the last family fled. | The fire produces light, heat, and ash, but the floor structure is intact and the fire isn't growing. | A neighborhood that has learned to use the glow as a landmark. No authority has entered. |
| 300 | Mythic | Beyond the threshold is a space the size of a cathedral nave, floored with soil, roofed with the underside of the night sky -- stars visible, but wrong stars in the wrong season. | A tree grows from the floor to the ceiling, old past any natural reckoning, and one door is set into its trunk. | In the roots, something that was once a person, woven into the wood, speaking in a voice like growth rings, answering any question put to it with absolute truth -- about things that haven't happened yet. |
```

**SEEDED (verbatim) — row 301, Mythic:**

```
| 301 | Mythic | The warren has no oldest street. Walk it end to end and every resident points to a different lane as the first one ever built — and every lane has proof: a cornerstone dated in an old hand, a grandmother buried under the threshold, a door that has always, always been that color. | The town's own founding charter, consulted on the spot, agrees with whichever lane you asked about last. | An old woman resetting a single loose cobblestone that she has reset, she says without any doubt at all, every day of her life and her mother's life before her — and the stone is always the first stone. |
```

Band ranges after: Grounded 1–198 · Textured 199–258 · Strange 259–285 · Volatile 286–297 · Mythic
298–**301**. The table's own preamble line was updated from `d300 — 300 unique rows, spice-graded
198/60/27/12/3` to `d301 — 301 unique rows, spice-graded 198/60/27/12/4`, with the Mythic-share
bump named in the preamble itself.

**The three Grounded rows that went with this seed are NOT applied — see §8-A.**

### 4.2 `urban-type` — d100 → **d110**, 10 rows (an 11th archetype)

*No Band column. Ten archetypes × ten rows each; the new block keeps that shape exactly, so every
existing archetype's share moves uniformly 10.00% → 9.09% and Residential Ward enters at the same
9.09%.*

**Why:** all ten existing archetypes are specialty districts — Market Ward, Harborfront, Temple
Ward, Noble Quarter, Slums, Industrial, Civic, Entertainment Strip, Underworks, Ruined Quarter.
**None is "an ordinary residential street."** The broad middle your own TIYL dice roll most (58% of
births "at home") had no archetype at all.

**EXISTING (calibration, verbatim):**

```
| 01 | Market Ward | Trade / daily commerce | Tight foot traffic; shouted prices; elbows and coinpurses. |
| 31 | Noble Quarter | Estates / influence | Manicured hedges; quiet guards; polite smiles with sharp edges. |
| 41 | Slums / Low Ward | Overflow housing | Smoke, damp cloth, and close quarters; hard stares, quick hands. |
```

**SEEDED (verbatim) — rows 101–110:**

```
| 101 | Residential Ward | Ordinary housing / domestic life | Laundry lines cross overhead; a woman calls a child in for supper. |
| 102 | Residential Ward | Ordinary housing / domestic life | Doorstep gossip in low voices; someone's cooking draws a small crowd of noses. |
| 103 | Residential Ward | Ordinary housing / domestic life | Repair work half-finished on a roof; a dog barks at nothing, then everything. |
| 104 | Residential Ward | Ordinary housing / domestic life | Shared well in a courtyard; buckets and elbows and an old argument about turns. |
| 105 | Residential Ward | Ordinary housing / domestic life | A funeral procession turns the corner; every door along the street closes at once. |
| 106 | Residential Ward | Ordinary housing / domestic life | Children's chalk games drawn over yesterday's, and the day before's. |
| 107 | Residential Ward | Ordinary housing / domestic life | A landlord's agent checks names against a list; someone ducks down a side path. |
| 108 | Residential Ward | Ordinary housing / domestic life | Window boxes and drying herbs; a neighbor borrows salt through a cracked door. |
| 109 | Residential Ward | Ordinary housing / domestic life | A newlywed couple's door garlanded; an older door two houses down left bare on purpose. |
| 110 | Residential Ward | Ordinary housing / domestic life | Quiet past the curfew bell; one window still lit, and everyone pretends not to notice. |
```

### 4.3 `data/building-kits.js` — a `theater` kit (registry, not a rolled table)

Theater had **no kit entry at all** — not even the minimal registration Bathhouse and Gambling Den
carry — so the three usable theatre rows already sitting in `building-interior` (#18, #253, #291)
were reachable only by accident through the untyped walk-in path, never by asking `rollBuilding` for
`type:"theater"`. Added at that same minimal level, plus the two realm labels the file's own
completeness invariant requires:

```js
theater: {
  label: "Theater",
  functionLine: "footlights, backstage nerves, a story sold nightly to whoever paid for a seat",
  proprietorRoleHint: "theater-manager",
  patronsLane: "audience-and-performers",
  economyTie: "none",
  hookLane: "gossip",
  namePattern: null,
  delegatesToShop: null,
  tavern: false,
},
// BUILDING_KIT_REALM_LABELS.chrome:  theater: "Vid-Palace",
// BUILDING_KIT_REALM_LABELS.gloom:   theater: "The Picture House",
```

This is **not** a claim that `VENUE-ASSEMBLY-01`'s tiered seating exists. It doesn't.

> The urban analyst deliberately ruled **no bulk d300 expansion** (per the adopted
> `BUILDING-INTERIOR-COVERAGE-AUDIT` §5 policy) and that narrowness was honored — one row, not
> forty.

---

## 5. Dungeon family

All three tables are `table_class: Fork` with **no Band column**. The band labels below are the
analyst's disclosed annotations for your calibration — **nothing was written into a band cell**, and
`compile-tables.py` reads none of them.

### 5.1 `dungeon-type` — d100 → **d112**, 12 rows

**Why:** 15% of dungeon-type rolls land on "Infrastructure Hub (Sewers / Aqueducts / Mines)" — the
single largest unmapped dungeon result in the 1,050-walk census — and mines were fused into the same
block as cisterns, which is exactly the wrong collapse (extraction-outward vs conveyance-inward).

**EXISTING (calibration, verbatim):**

```
| 12   | Natural Cavern         | Geological formation          | Slick calcite formations catch pale light.              |
| 71   | Sunken Estate          | Manor house / Basement levels | Decadent wallpaper peels in damp air.                   |
| 100  | The Living Hive        | Biological growth / Nest      | Pulsing walls breathe in warm, claustrophobic rhythm.   |   ← already reads Mythic today, uncorrected (§8-D)
```

**SEEDED (verbatim) — rows 101–112 (annotated tier in the right margin):**

```
| 101  | Mine / Extraction Works | Extraction / Ore working | Timber-braced tunnels smell of turned earth and cold iron. |          (Grounded)
| 102  | Mine / Extraction Works | Extraction / Ore working | Ore carts sit cold on rails worn bright by use. |                     (Grounded)
| 103  | Mine / Extraction Works | Extraction / Ore working | Deep drill-scars spiral against the grain of the rock, following no vein a miner would recognize. |   (Strange)
| 104  | Mine / Extraction Works | Extraction / Ore working | The seam gave way to something that pulses, faintly, in time with every miner's heartbeat still down there. |  (Mythic)
| 105  | Prison / Asylum         | Containment / Isolation | A ledger of names covers one wall, each entry crossed through in a different hand. |   (Textured)
| 106  | Prison / Asylum         | Containment / Isolation | The cell doors are numbered in a sequence that skips every number a prisoner has ever spoken aloud. |  (Strange)
| 107  | Prison / Asylum         | Containment / Isolation | The bars are grown, not built — hardwood knit shut around old prisoners, and new shoots are still sealing the seams. |  (Mythic)
| 108  | Military Fortification  | Defensive bunker / Outpost | Chain-of-command plaques still hang in order, though the names have all been scratched to nothing. |  (Textured)
| 109  | Military Fortification  | Defensive bunker / Outpost | The fortifications keep going long after any reasonable siege would have ended — walls behind walls behind walls. |  (Strange)
| 110  | Military Fortification  | Defensive bunker / Outpost | This was never one keep. Three garrisons built over three centuries, each certain it was the first, each wall arguing with the one before it. |  (Volatile)
| 111  | Infrastructure Hub      | Sewers / Aqueducts / Mines | Cistern locks are stamped with a ward crest nobody currently in charge recognizes. |  (Textured)
| 112  | Infrastructure Hub      | Sewers / Aqueducts / Mines | Every channel in the system flows toward one cistern, uphill, against any grade a mason would have cut on purpose. |  (Mythic)
```

**Archetype share, before → after (of 112):** Natural Cavern 20.00→17.86 · Subterranean Crypt
20.00→17.86 · Military Fortification 15.00→**16.07** (+3) · Infrastructure Hub 15.00→**15.18** (+2) ·
Sunken Estate 10.00→8.93 · Religious Sanctuary 8.00→7.14 · Prison/Asylum 6.00→**8.04** (+3) ·
Laboratory 3.00→2.68 · Megastructure 2.00→1.79 · Living Hive 1.00→0.89 · **Mine/Extraction (new)
0→3.57**. Cavern+Crypt still hold the plurality at 35.7%.

### 5.2 `dungeon-area-type` — d200 → **d215**, 15 rows

**EXISTING (calibration, verbatim — one per register):**

```
| **051** | Standard Chamber | 20' x 20' square | 10' x 10' attached storage room; shelving brackets remain on the walls, goods long looted. |
| **150** | Prison Block | 30' x 50' rectangle | Ten 5' x 10' cells flanking the central hall; each has a barred door, most hanging open. |
| **200** | Planar Gate Room | 40' x 40' octagon | Inlaid binding circle (25' diameter) at the center; 10' x 20' elevated viewing gallery at one face; the air hums faintly regardless of what has occurred here. |
```

**SEEDED (verbatim) — rows 201–215:**

```
| **201** | Cistern Chamber | 25' x 25' square, 8' ceiling | Sunken basin fills the center (4' deep, still water); 10' x 10' raised inspection walk along one wall, iron rail missing two sections. |
| **202** | Aqueduct Channel | 10' x 50' straight, open channel down the center | 3' wide flowing channel runs the full length (2' deep, moving water); 5' x 5' maintenance landing where the channel passes under a low arch. |
| **203** | Pump / Valve Room | 15' x 15' square | 10' x 10' array of iron valve-wheels and pipe junctions along one wall; sump pit in the floor (3' deep) feeds a seized pump mechanism. |
| **204** | Culvert Junction | 5' diameter, three converging pipes | Each culvert mouth is a 3' circle at a different height; center floor is a grated drain over a 10' drop to a lower channel. |
| **205** | Well Shaft | 6' diameter vertical shaft | Iron rungs descend the shaft wall; 5' x 5' landing halfway down where a side culvert breaks into the shaft. |
| **206** | Ore Face / Work Gallery | 15' x 25' irregular, angled ceiling | The working face is a 10' wide seam of exposed ore; tool marks and a scatter of broken picks lie at its base. |
| **207** | Haul Ramp Landing | 15' x 20' graded landing | Cart rails converge here from two directions; 10' x 10' loading apron where carts are tipped and reloaded. |
| **208** | Sorting & Repair Yard | 20' x 25' rectangle | Sorting troughs and waste bins line one wall; 10' x 10' repair bench alcove with spare timber stacked against it. |
| **209** | Pump Sump / Flooded Branch | 20' x 20' square, floor slopes down 5' | Standing water fills the lower half (2'-4' deep); a chained pump mechanism sits at the boundary, working or not. |
| **210** | Keeper's Control Landing | 10' x 15' raised platform (6' up) | Overlooks the cell fronts below; iron stair or ladder access; desk and key-ring pegs bolted to the rail. |
| **211** | Sally-Port / Interlock | 8' x 10' between two barred doors | Only one door can be unlocked at a time (mechanism visible); no cover inside, deliberately. |
| **212** | Intake & Property Room | 15' x 15' square | Search table at the center; 10' x 10' locked property cabinet recessed into the far wall, tags and ledger nearby. |
| **213** | War Room / Strategy Hall | 20' x 25' rectangle | A large tilted map table dominates the center; 10' x 10' alcove holds racked dispatch tubes and a cold brazier. |
| **214** | Battlement / Siege Deck | 10' x 60' open-topped walkway | Crenellations line the outer edge (half cover); 10' x 10' engine mount at one end, ballista or trebuchet anchor bolts still in the stone. |
| **215** | Suspended Prison Ward | 30' x 30' void with a hanging cell cluster | Living-wood cell cages hang from thick roots or chains over a black drop; a single winch gangway is the only fixed crossing. |
```

12 of 15 sit in the ordinary-functional / institutional-programmed registers that already carry
87.5% of the table; only **215** reads Mythic (1/215 = 0.47%, *below* the table's own ~3% top-band
share). **215 is the first atomic row anywhere that produces `RC-PRISON-01`** — your retained
"wooden crate-like cell, grown into shape and suspended over a void," which until now needed three
separate rolls from three separate systems to compose.

### 5.3 `dungeon-feature` — d153 → **d169**, 16 rows

**EXISTING (calibration, verbatim):**

```
| 67   | Drainage Grate     | Iron lattice hums faintly with water below. | 5'×5' opening, 1' deep frame — Pry open DC 12 Str; 10' drop to channel below |
| 151  | Cold Hearth        | A great fireplace set into the wall, ash long dead in the grate. | 6'×3' footprint, 8' high — Half cover; flue is a 1'-wide climb-shaft to the level above (DC 13 Athletics) |
```

**SEEDED (verbatim) — rows 154–168 (dungeon family) + 169 (dressing family):**

```
| 154  | Aqueduct Trough    | An open stone channel of moving water cuts across the floor. | 3' wide, 2' deep, spans room — Difficult Terrain to cross; DC 10 Athletics or wade (loud) |
| 155  | Aqueduct Trough    | Waist-high stone trough carries water along one wall, overflow dripping steadily. | 2' wide, 3' high, 20' long — Half cover; current strong enough to sweep a dropped object away |
| 156  | Sluice Gate Mechanism | A heavy iron gate spans the channel, worked by a corroded rack-and-pinion wheel. | 5' wide gate, 4' high — DC 14 Str to raise; opening floods or drains an adjacent area within 1 minute |
| 157  | Cistern Overflow Grate | A sunken grate vents excess water with a steady rushing echo from below. | 5' x 5' opening, 1' deep frame — Pry open DC 12 Str; sound carries 60' through the channel system |
| 158  | Shoring Frame      | A timber support frame braces the passage, joints pinned and sound. | 5' wide, 8' high — Total cover per post; marks the last-safe boundary before unsupported ground |
| 159  | Shoring Frame      | A support frame has split along one post, timber creaking under load. | 5' wide, 8' high, visibly strained — Total cover; collapses on 12+ damage (2d6 Bludgeoning, DC 13 Dex half) |
| 160  | Ore Cart & Rail Track | A length of iron rail runs through the room, one loaded ore cart parked on it. | Rail 2' wide, cart 4'x3'x3' — Cart is Half cover, can be pushed (DC 10 Str) to block or ram a 5' space |
| 161  | Windlass / Winch Mechanism | A hand-cranked hoist stands over a vertical shaft, cable taut. | 4'x4' footprint, 6' high — Str DC 12 to crank; can raise/lower 300 lbs at half speed |
| 162  | Cell Grille Door   | A barred door, man-height, set into a partition wall. | 3' wide, 7' high — Str DC 15 to bend bars; lock DC 13 Thieves' Tools |
| 163  | Property Lockbox   | An iron-strapped chest sits bolted to the floor, tagged with a wax seal. | 3'x2'x2' footprint — Half cover; DC 15 Str or DC 13 Thieves' Tools to open; contents tagged and cataloged |
| 164  | Keeper's Watch Desk | A raised desk faces the room, a ledger and key-ring pegs within reach. | 4'x3' footprint, 3' high — Half cover; Investigation DC 12 reads recent entries |
| 165  | War Table          | A large tilted map table dominates the space, pins and painted terrain still in place. | 6'x8' footprint, 3' high — Half cover; History or Investigation DC 12 reads the plotted campaign |
| 166  | Siege Engine Mount | A fixed cradle and anchor bolts mark where a heavy engine was once, or is still, seated. | 8'x8' footprint — Total cover if occupied; DC 14 Athletics to re-arm a stripped mount in 1 minute |
| 167  | The Weeping Cistern | A vast reservoir fills the chamber, its surface moving faintly against no draft, no current, no reason. | 40'x40'x10' deep — every channel in the level runs toward it; Insight DC 16 or the room feels watched |
| 168  | Suspended Growing Cell | A cage of living hardwood hangs from thick roots over a black drop, new shoots still sealing its seams. | 5'x5'x6' cell, 15'-40' up — DC 14 Athletics to reach; bars are AC 16, 30 HP, regrow 5 HP/day if not burned |
| 169  | Hooded Work Lamp Post | A worker's hooded oil lamp still hangs from an iron post, its shutter half-closed. | 1' diameter post, 5' high — Dim Light 10' radius when lit; Half cover from the post itself. |
```

**167 and 168 are the annotated-Mythic pair.** Unique-landmark share goes 4/153 (2.61%) → 6/169
(3.55%) — proportionate to the table's own precedent, not a step change.

> **Deviation, disclosed:** row 169 (Hooded Work Lamp Post) was proposed as row 154 by the dressing
> analyst; the dungeon analyst had already claimed 154–168. Text unchanged, number moved.

---

## 6. Occupancy / threat family

### 6.1 `dungeon-threat-identity-t1` — d30 → **d33**, 3 rows · 6.2 `-t2` — d45 → **d48**, 3 rows

*No Band column (Identity / Behavioral Role / CR pools / Composition / Signature). Site 6
Prison-Custody is a full golden-site family with a 1,135-line spec and had **zero** table-side
representation: across all 69+30+45 dungeon and 30+50 urban threat-identity rows, not one names a
jail, gaol, stockade, holding office, custody staff, or prisoner population.*

**EXISTING (calibration, verbatim, T1 row 30):**

```
| **30** | Hag Domain | Core Presence | Dominated Humanoid / Swarm of Insects | Sea Hag / Green Hag | Green Hag (Coven Leader) / Night Hag | 1d2 per room; 1 Mid per 2 rooms; 1 Boss at finale | Pickled remains in jars on every shelf; caged animals with offer-tags attached; contract terms cut into stone |
```

**SEEDED T1 (verbatim) — rows 31–33:**

```
| **31** | Custody Institution | Professional Watch | Guard / Commoner (trusty) | Veteran / Spy (record-keeper) | Warlord / Knight (the Keeper) | 1d4 per block; 1 Mid per 2 blocks; 1 Boss at finale (plus 2d6 prisoners, noncombatant unless armed) | Ledger of names chalked by the door; one set of keys on one belt; a household routine bleeding into the cell block |
| **32** | Broken Custody | Displaced Wanderers | Commoner (former prisoner) / Thug | Bandit Captain / Veteran (turned guard) | Warlord (self-declared warden) / Assassin | 1d4 per room; 1 Mid per 3 rooms; 1 Boss at finale (former inmates now hold the keys) | Cell doors forced open and left hanging; guard uniforms repurposed and ill-fitting; old tally marks beside fresh ones scratched by the newly caged |
| **33** | Militant Cloister | Professional Watch | Acolyte / Guard | Cult Fanatic / Veteran | Gladiator (Sworn Champion) / Knight (Prior-Militant) | 1d4 per room; 1 Mid per 2 rooms; 1 Boss at finale | A communal routine still posted on the wall, now enforced at spear-point; devotional marks defaced or doubled; novices drilling where they used to pray |
```

**EXISTING (calibration, verbatim, T2 row 45):**

```
| **45** | Devil Pact | Specialist Task-Force | Imp / Bearded Devil | Barbed Devil / Chain Devil | Horned Devil / Bone Devil | 1d2 per room; 1 Mid per 2 rooms; 1 Boss at finale | Contract language covering every surface; souls sealed in gems visible in alcoves; hellfire scorch circles at ritual sites |
```

**SEEDED T2 (verbatim) — rows 46–48:**

```
| **46** | Custody Institution | Professional Watch | Veteran / Spy | Gladiator / Berserker Pack | Warlord / Assassin (the Keeper) | 1d4 per block; 1 Mid per 2 blocks; 1 Boss at finale (Keeper-House doctrine: one named keeper's authority binds the whole roster) | Keys and reputation both hang from one belt; kin sleep in the gatehouse; the boundary between household and holding block is a single unlocked door |
| **47** | Warded Exceptional Containment | Latent Mechanisms | Animated Armor / Flying Sword | Shield Guardian / Stone Golem | Iron Golem + Mage (Warden-Adept) | 1 per cell-ward; 1 Mid per 2 wards; 1 Boss at finale (the containment holds something worse than its guards) | Ward-seals renewed daily in fresh chalk; every corridor's attention bends toward one door; the entire routine schedule exists to keep that door closed |
| **48** | Contested Claim | Specialist Task-Force | Scout / Thug | Bandit Captain / Veteran | Warlord / Assassin (rival claimant) | 1d2 per work-face; 1 Mid per 2 work-faces; 1 Boss at finale (two rosters, one seam — roll twice on Category for the second crew) | Claim-stakes driven in duplicate, one set older; ore carts marked with two different guild brands; a support timber freshly sabotaged, not yet reported |
```

**COMPANION applied** (`src/engine/walk-archetypes.js`): the five new identity strings were
registered so their bestiary-substitution floor isn't narrower than every existing identity's.
`Custody Institution` / `Broken Custody` / `Militant Cloister` → humanoid, urban habitat;
`Warded Exceptional Containment` → construct; `Contested Claim` → humanoid. Non-blocking by that
file's own contract, but there was no reason to leave the new rows worse off.

### 6.3 `urban-threat-identity-t1` — d30 → **d32** · 6.4 `-t2` — d50 → **d52**

**EXISTING (calibration, verbatim):**

```
| 4 | **Corrupt Guard** | Guard / Soldier | Captain / Veteran | Warlord / Knight |
| 30 | **Cloaked Cult of the Old God** | Cultist / Commoner | Cult Fanatic / Assassin | Assassin / High Priest |
| 3 | **Smuggling Cartel** | Cultist / Commoner | Bandit Captain / Mage | Crime Lord / Warlord |          (T2)
| 50 | **Lich's Undead Army** | Zombie / Skeleton | Wight / Ghast | Lich / Mummy Lord |                    (T2)
```

**SEEDED (verbatim):**

```
| 31 | **Debtor-Ledger Custody House** | Guard / Commoner (bonded laborer) | Veteran / Spy (record-keeper) | Warlord / Knight (magistrate-enforcer) |     (T1)
| 32 | **Shanty-Quarter Guest Camp** | Commoner / Bandit | Bandit Captain / Veteran | Warlord / Gladiator |                                              (T1)
| 51 | **City Prison Uprising** | Guard / Thug | Veteran / Berserker Pack | Warlord / Champion (self-declared Warden) |                                   (T2)
| 52 | **Quarantine Authority** | Guard / Commoner (quarantined) | War Priest / Poisoner | Evil High Priest / Mummy Lord (the quarantine's true cause) |  (T2)
```

T1 row 32 is the **urban-hosted expression of your guest-family camp property** — the impoverished /
shanty quarter rung, which the catalog says banks toward Site 10's district vocabulary.

### 6.5 `faction-basic` (markdown) + `T.faction` (`data/world-tables.js`) — d100 → **d105**, 5 rows

**EXISTING (calibration, verbatim, markdown):**

```
|1-4|Grounded|**The Iron-Strap Guild:** A powerful collective of blacksmiths and engineers who control the region's bridge and gate maintenance.|
|81-83|Textured|**The Glass-Singers:** Artisans who can manipulate "Fused Glass" through resonant tones and specific music.|
|100|Strange|**The Weaver-Kings:** Beings who "weave" reality from sentient silk thread, treating the world as a project they can unmake at any time.|
```

**SEEDED (verbatim, markdown)** — full text of all five rows is in §2 (the Volatile block and the
Mythic block). Ranges: 101 · 102 · 103 · 104 Volatile, 105 Mythic, each as its own single-value row
matching how rows 96–100 are already written individually.

**BOTH mirrors updated in the same change (this table lives in two places):**

1. `data/world-tables.js` → `T.faction`: `die:100` → `die:105`, five `[lo,hi,band,name,desc]` rows
   appended. **This is the array world genesis actually reads** — seeding only the markdown would
   have left every new row unreachable in play.
2. `data/world-tables.js` → `FRAG.faction`: five new 6–10-word sensory hooks appended in the same
   order, keeping the documented index alignment intact —
   *"jailers who agree on who may cross a border" · "clerks who decide who is legally a person" ·
   "three mine claims shut down on the same day" · "the displaced, keeping a ledger of their hosts" ·
   "a three-century verdict still looking for the guilty."*

**Metadata note (no row touched):** `Faction - Basic.md` had no `table_class` at all, which is a
false-modest label on a table that now reaches Mythic. It gained `table_class: Commitment`. This has
zero mechanical effect — the file's `type: faction` means neither `compile-tables.py` nor
`lint-tables.py` reads it. Its band vocabulary also diverges from the JS mirror's ("Textured" in
markdown vs "Less Grounded" in `T.faction`); **that pre-existing mismatch was left alone** — it is
your call, not a seeding decision.

---

## 7. Dressing / props family

### 7.1 `T.arch` (`data/world-tables.js`) — die 100 → **101**, 1 Mythic row

*The only table in this whole family with a real Band column. It had zero waterside/tidal/estuarine
construction entries, against Port/Harborfront being the best-evidenced settled-life gap (12.02% of
urban arrivals unmapped, the most-rolled TIYL origin).*

**EXISTING (calibration, verbatim — two per band):**

- Grounded — *Rough-Hewn Basalt:* Heavy dark volcanic stone with visible chisel marks. · *Timber &
  Daub:* Weathered oak beams with white-washed infill and straw thatch.
- Textured — *Fused Glass:* Multicolored sand melted into translucent, jagged walls. · *Bone &
  Sinew:* Lashed megafauna bone, scrimshawed and weather-bleached.
- Strange — *Living Ironwood:* Hardwood still growing, with leaves sprouting from the eaves. ·
  *Bioluminescent Moss:* Soft glowing organic matter painting light onto the walls.
- Volatile — *Frozen Smoke:* Walls of soot held solid, warm to the touch, slowly thinning. ·
  *Sounded Glass:* Panes that hold a note; the building hums the day's weather.
- Mythic — *Sentient Silk:* Thick woven thread that vibrates slightly and repairs its own tears.

**SEEDED (verbatim):**

```js
[101,101,"Mythic","Tideglass","Walls of fused salt-glass that turn to seawater at high tide and remember their shape at low — for six hours of every day, the town has no walls at all."],
```

`FRAG.arch` gained its aligned veil line: *"the town has no walls for six hours a day."*

> **This is the largest deviation in the pass and you should read §8-B.** Only the Mythic rung was
> seeded; the four lower-band waterside rows the analyst wrote could not be applied additively.

### 7.2 `urban-interactable-object` — d300 → **d301** · 7.3 `urban-set-dressing` — d105 → **d106** · 7.4 `wilderness-set-dressing` — d305 → **d307**

*No Band columns anywhere here — `Fork`/`Spark` catalogue tables, ceiling-only.*

**EXISTING (calibration, verbatim):**

```
| 72   | **window shutter**                  | Access      | Distraction | Loud     | Obvious     | Mundane |
| 166  | **Brass Gong**                      | Distraction | Social      | Loud     | Obvious     | Mundane |
| 103 | A tattered awning over a shuttered stall, one strut snapped so it sags to the cobbles. |
| 104 | A clothesline strung between windows, greyed washing left out through too many rains. |
|**303**|A cold fire pit ringed with blackened stones, one boot-print pressed in the ash.|
|**305**|A cluster of lichen-crusted boulders, one balanced in a way that shouldn't hold.|
```

**SEEDED (verbatim):**

```
| 301  | **Shutter-Counter Storefront**      | Access      | Resource    | Quiet    | Obvious     | Mundane |
| 106 | A collapsible market stall, awning rolled and lashed, counter locked for the night. |
|**306**|A camp wash-stand of lashed poles and a hide basin, grey water pooling beneath the drain-hole.|
|**307**|A field-kitchen lean-to, cook-fire cold, a suspended pot still swinging on its hook.|
```

Row 301 commits Site 10's **two-state shutter-counter** — the one prop Site 10's own proof gate
flags as having no direct visual evidence. Row 106 fixes the fact that `urban-set-dressing` (the
general per-segment roll every urban walk makes) had **no market stall at all**, despite markets
being narrated everywhere; the one physical stall in the corpus lives inside a single fixed
Scene-Frame slot most walks never reach.

---

## 8. Skipped and deviated — the log

### 8-A. SKIPPED (law conflict) — the three Grounded `building-interior` rows

**Proposal:** insert 3 Grounded rows as new 199–201, shifting every existing row ≥199 down by +3.

**Why skipped:** that renumbers 102 of your existing rows' roll ranges. This pass is bound to
additive-only, and "never modify an existing row" is the law it was given. `building-interior` is
strictly band-ordered (Grounded 1–198, Textured 199–258, …), so a Grounded row **cannot** be
appended at the tail without inverting your spice ladder — a player rolling 302 would read
low-stakes flavor. Neither option was mine to take unilaterally.

**They are good rows and they close real gaps (dwelling bottom rung, warren tenement, working quay).
Say the word and they go in as 199–201 with the +3 shift. Full text, ready to apply:**

- **199 · Grounded** (dwelling bottom rung) — *Layout:* One room built from scavenged ship's timber
  and packing-crate slats, a curtain instead of a second door, no glass in the single window. ·
  *Notable Feature:* A cook-fire ring of stacked bricks in the corner, the only masonry in the
  place, clearly older than the walls around it. · *Who/What Is Inside:* A family of four sharing
  two blankets between them, awake, watching the door the moment it opens.
- **200 · Grounded** (warren tenement stairwell) — *Layout:* A single stairwell serving four floors
  of one-room lets, a landing at each floor, one shared privy in the yard below. · *Notable
  Feature:* Names and tally-marks scratched by the third-floor landing — rent paid, rent owed, going
  back years in different hands. · *Who/What Is Inside:* A boy of about ten sitting on the
  second-floor step, minding the stair for a coin, who has already priced you.
- **201 · Grounded** (working quay, customs edge) — *Layout:* A harbor-mouth customs post: an
  inspection counter facing the water, a locked hold for cargo pending clearance, a tide-board
  nailed up outside. · *Notable Feature:* A manifest ledger open to today's date, every entry
  stamped except the last one, which is only initialed. · *Who/What Is Inside:* A customs clerk
  counting the same crate twice, out loud, in front of you, so you both hear the number.

### 8-B. DEVIATED — `T.arch` got 1 row, not 5 (and not 100)

**Proposal:** double `T.arch` to d200, mirroring the exact 66/20/9/4/1 split (132/40/18/8/2), with 5
representative waterside rows insertable "now at the low end of each new range."

**Why deviated:** as literally written, that leaves 95 uncovered die faces (rolls 102–166, 168–186,
188–195, 197–199) — every one of them would fall through to the lookup's last-row default. The full
form needs 100 authored rows, which the analyst itself calls your craft pass, not an integrator's
job. So only the **Mythic** rung was applied, appended at the tail where it lands inside the
existing Mythic band and no existing row moves.

**The four unapplied waterside rows, ready for your hand (each needs a mid-band insert):**

- **Grounded — Tarred Pile-and-Plank:** Creosote-black pilings capped with tide-slick planking,
  replaced board by board as the sea takes them.
- **Textured — Barnacle-Crusted Ballast Stone:** Dressed stone once carried as a ship's ballast, now
  cemented into the seawall by generations of barnacles.
- **Strange — Weeping Brinewood:** Timber that never fully dries; press a hand to it and salt water
  beads to the surface, however far from the tide.
- **Volatile — Slack-Tide Stone:** Masonry that softens to wet clay at the ebb and sets hard again
  at the flood — the wall is only a wall twice a day.

Their `FRAG.arch` veil lines, if applied: *"tar-black pilings, planking replaced board by board" ·
"ballast stone crusted white with barnacles" · "timber that beads salt water, dry land or no" ·
"a wall gone soft as clay at the ebb."*

### 8-C. SKIPPED (gate conflict, caught by a real harness) — the two `tavern-foundation` rows

**Proposal:** add rows 21–22 ("Posting-house", "Quiet coaching inn") to the Tavern Type d20, closing
the fact that `BUILDING_KITS.tavern.economyTie` is hardcoded `"lodging"` for every roll while the
flavor table never once produces a lodging-primary venue.

**Why skipped:** applied, then reverted, because `dev/verify-urban-fabric.mjs` check 9 exists
specifically to assert that every extracted Tavern table is **byte-identical to its archived
source** — the file's own preamble says "EXTRACTED VERBATIM … Adam's authored content; moved, not
rewritten." The seed failed that gate:

```
✗ 9. every extracted Tavern table's row text is byte-identical to its archived-source block
     (8 sections compared) — ["Tavern Type (d22) …" — no matching heading in archived source"]
```

A second, independent reason the skip was right: the compiled table id is derived from that heading
(`tavern-type-d20-source-dmg-p-113`). Renaming the heading to `(d22)` would have **renamed the
compiled table**, orphaning any consumer. Weakening or "disclosing around" that harness would have
been satisfying a validator mechanically instead of preserving its job.

**The gap is real and unclosed.** The honest home for a lodging-primary register is a new
Genesis-authored table beside the extraction, or your own edit to the archived source — a founder
call, not an integrator's.

### 8-D. NOT APPLIED (flagged for your ruling) — `table_class` promotion on the three dungeon tables

`dungeon-type`, `dungeon-area-type` and `dungeon-feature` are all `table_class: Fork`, whose
SPICE-CURVE ceiling is **Strange** — yet they already contain rows that read Volatile/Mythic
(*The Living Hive*, *The Megastructure*, *Reality Fracture*, *Planar Gate Room*). Lint can't see it
because CHECK 10a needs a Band column these files don't have. The seeded annotated-Mythic rows
(101–112's 104/107/112, 215, 167/168) extend that standing condition rather than creating it.

The clean fix is a one-word frontmatter change per file, `Fork` → `Commitment`, exactly as already
done for Chase Complications / Dungeon Loot - Valuables / In-Building Complications. **Not applied —
it's a taste ruling about what those tables are allowed to be.**

### 8-E. Applied-but-worth-knowing

1. **Two row-number collisions resolved by serial order.** `wilderness-feature` 304–305 → **316–317**
   and `dungeon-feature` 154 → **169** (the wilderness and dungeon analysts had claimed those numbers
   first). Text unchanged in both cases.
2. **One harness assertion scoped, not deleted.** `dev/verify-codex-roll.mjs` asserted the three
   Phase-5 tables have **exactly** 300 rows. `building-interior` is now 301 by your direction. The
   check's job — "the d300 tier compiled and is fully populated" — is preserved by changing `===300`
   to `>=300`, with an in-file comment saying so and warning against re-tightening it without
   deciding those tables are frozen. A truncated compile still fails.
3. **Two generated artifacts were regenerated, exposing pre-existing staleness that is not mine.**
   `tables.json` at HEAD was missing 4 tables another lane had already authored
   (`opening-register-medias`, `opening-register-mythic`, `opening-register-wrong`,
   `starting-state-opening-register`). A truthful recompile picked them up, which then reddened
   `dev/verify-table-usage-data.mjs` (386 vs 390). Fixed by regenerating from source —
   `build/gen-table-usage-audit.py` then `build/gen-table-atlas.py` — never by hand. Those 4 tables
   ride along in this commit as a side effect of an honest recompile; they are not seeded content.
4. **What the analysts named but nobody seeded, on purpose.** No Engine table owns "who runs a road
   checkpoint" or "who is camped at a route edge" (Sites 1 and 2's occupancy vocabulary) — that is a
   structurally missing table, and forcing those rows into a monster-roster table would have
   misrepresented coverage. Likewise the biggest dressing-family finding is a **wiring** gap, not a
   row gap: `urban-feature` (103 authored rows), the three Dressing Mega Tables, and
   `Furniture & Clutter` have **zero call sites in `src/`** — hundreds of authored rows that no
   roller ever reads. No number of new rows fixes that.

---

## 9. Gates — verbatim

Run on the branch after every application. Two harnesses were **already red before this pass**
(`verify-env1b-tabletop-shadows` 34/1 and `verify-theater-surface` 7/2 — pixel-diff render checks,
unrelated to tables); their pass/fail counts are byte-identical before and after.

```
$ python3 "Engine/00. _System/compile-tables.py" --emit
EMIT — dice tables: 406 | clean: 389 | bell/mixed (confirmed): 5 | REAL bugs: 0 | starts-high(check): 0 | special(skip): 17 | lookup-matrices: 25
emitted tables.json + tables.js: 390 tables

$ python3 dev/verify-table-lint.py
37 passed, 0 failed

$ python3 build/check-manifest.py
RESULT: OK

$ for f in dev/verify-*.mjs matching walk|wild|table|dressing|place|biome|theater (+ env2-travel, codex-roll, urban-fabric)
44 harnesses run — 42 exit 0, 2 pre-existing reds unchanged from baseline
```

Per-table compiled verification (die size, coverage, duplicate faces) read straight out of the
regenerated `tables.json`:

```
wilderness-feature               dice=d317  rows=317 gaps=0 dups=0
wilderness-encounter-type        dice=d24   rows=24  gaps=0 dups=0
wilderness-area-type             dice=d312  rows=312 gaps=0 dups=0
wilderness-biome-type            dice=d11   rows=11  gaps=0 dups=0
walk-skin-wilderness             dice=d101  rows=101 gaps=0 dups=0  bands=[Grounded,Textured,Strange,Volatile,Mythic]
building-interior                dice=d301  rows=301 gaps=0 dups=0  bands=[Grounded,Textured,Strange,Volatile,Mythic]
urban-type                       dice=d110  rows=110 gaps=0 dups=0
dungeon-type                     dice=d112  rows=112 gaps=0 dups=0
dungeon-area-type                dice=d215  rows=215 gaps=0 dups=0
dungeon-feature                  dice=d169  rows=169 gaps=0 dups=0
dungeon-threat-identity-t1       dice=d33   rows=33  gaps=0 dups=0
dungeon-threat-identity-t2       dice=d48   rows=48  gaps=0 dups=0
urban-threat-identity-t1         dice=d32   rows=32  gaps=0 dups=0
urban-threat-identity-t2         dice=d52   rows=52  gaps=0 dups=0
urban-interactable-object        dice=d301  rows=301 gaps=0 dups=0
urban-set-dressing               dice=d106  rows=106 gaps=0 dups=0
wilderness-set-dressing          dice=d307  rows=307 gaps=0 dups=0

T.arch     die 101  rows 25  FRAG 25  gaps 0 dups 0
T.faction  die 105  rows 33  FRAG 33  gaps 0 dups 0
```

Every archived original sits at `<table-dir>/Archive/<Name>.2026-07-27.md`. Both `compile-tables.py`
and `lint-tables.py` skip `/Archive`, so the snapshots never compile and never lint.

> **The archive copies are deliberately NOT committed.** `.gitignore:39` carries `Archive/` with an
> explicit repo ruling attached: *"Pre-git manual backups — git history replaces these going forward.
> (Left on disk, just untracked.)"* Force-adding them would contradict that decision, so they sit on
> disk as belt-and-braces only. The authoritative pre-edit text of every touched file is
> `git show <the commit before this one>:<path>`.

---

## 10. PROPOSED WAVE 2 — the new site-spec spawnable inventories (NOT applied)

Ten `SPAWNABLE` inventories were authored today in the `Genesis-sites` worktree
(`feat/golden-sites-campaign`), one per site, at `docs/intel-sites/SITE-<n>-SPAWNABLE.md`. **Nothing
from them was applied here.** Every one carries the header
`STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)`, and they are still
untracked files in that lane. **That review is the wave-2 gate.**

Each maps every concrete thing its working spec implies can spawn to the Engine table or roller that
would produce it, using the roller-preservation ledger's own status vocabulary (`LIVE` ·
`LIVE-COMPOSED` · `AUTHORED-UNWIRED` · `ORACLE-MANUAL` · `INTERPRETIVE` · `TARGET-ADAPTER` ·
`NO-TABLE-YET`).

| site | file | inventory rows | `NO-TABLE-YET` | `AUTHORED-UNWIRED` | `TARGET-ADAPTER` |
|---|---|---:|---:|---:|---:|
| 2 — camp / service | `SITE-2-SPAWNABLE.md` | 38 | 18 | 1 | 3 |
| 3 — dormant / abandoned (transform) | `SITE-3-SPAWNABLE.md` | 132 | 45 | 5 | 1 |
| 4 — monastery / commune | `SITE-4-SPAWNABLE.md` | 54 | 19 | 8 | 3 |
| 5 — strained mine / workshop | `SITE-5-SPAWNABLE.md` | 50 | 30 | 1 | 4 |
| 6 — prison / custody | `SITE-6-SPAWNABLE.md` | 47 | 29 | 1 | 3 |
| 8 — layered control | `SITE-8-SPAWNABLE.md` | 82 | 37 | 11 | 0 |
| 9 — contested fortress | `SITE-9-SPAWNABLE.md` | 140 | 60 | 6 | 0 |
| 10 — urban institution | `SITE-10-SPAWNABLE.md` | 50 | 22 | 1 | 4 |
| 11 — mixed scale / dragon domain | `SITE-11-SPAWNABLE.md` | 66 | 24 | 5 | 4 |
| 12 — anomalous / living / mobile | `SITE-12-SPAWNABLE.md` | 123 | 56 | 9 | 0 |
| **total** | | **782** | **340** | **48** | **22** |

**Read of the shape:** roughly **44% of everything the twelve site specs imply can spawn has no
table behind it at all**, and another 48 items are authored-but-never-rolled. Sites 9 (contested
fortress, 60 holes), 12 (anomalous/living/mobile, 56) and 3 (dormant transform, 45) carry the
heaviest demand — and all three were `OPEN` on the catalog status table this morning, so their specs
themselves are same-day work.

**Wave-2 gate, and why nothing here moved:** these inventories are drafts pending Codex adversarial
review; they classify demand rather than propose rows; and the biggest categories in them
(`AUTHORED-UNWIRED`, `TARGET-ADAPTER`) are **wiring** work, not row work — a seeding pass cannot
discharge them. Wave 2 should start after that review, and should probably start by deciding which
of the 340 `NO-TABLE-YET` items deserve a table at all versus staying interpretive.

---

## 11. What I'd most like you to rule on

1. **§8-A** — do the three Grounded `building-interior` rows go in with the +3 renumber? (Your table,
   your call. They close the settled-life dwelling/warren/quay gap.)
2. **§3.2** — Discovery jumping from 5% to 20.8% of wilderness encounters. Right size, or cut to 3
   rows (13.6%)?
3. **§3.4** — `wilderness-biome-type` gaining a 9.1% Fey-Bent Hollow, against `travel-biome`'s 3%
   precedent for the same idea.
4. **§8-D** — promote the three dungeon tables `Fork` → `Commitment`, or narrate the hot rows down?
5. **§8-C** — where does a lodging-primary tavern register actually live, given the extraction is
   contractually verbatim?
6. **§8-B** — is the waterside material register worth a proper `T.arch` d200 craft pass?
