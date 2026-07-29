STATUS: EVIDENCE PACKET — CODEX ADVERSARIAL CORRECTION APPLIED 2026-07-28

# ENGINE EVIDENCE — where Site 12 actually comes from, measured

type: research-lane
date: 2026-07-27
site: 12 — anomalous / living / mobile
method: read the editable table SOURCE (`Engine/03. _Tables/…`, `data/starting-state.js`),
then EXECUTE the live tag path rather than eyeballing it. `tables.js` / `tables.json` were
never opened (two `grep -c` presence checks only, per the standing token rule).

## Why this lane exists

The campaign brief hands Site 12 one demand number: **"Living Hive 1.2% of dungeons."**
That number is real and correctly measured (`intel/walk-census.md` §3: 3 of 253 dungeon
rolls). It is also the *smallest* of Site 12's doors, and taking it as the site's demand
would have sized the whole spec wrong.

This lane audits every path the engine has that can commit substrate-anomaly truth.

## 2026-07-28 measurement correction

This packet locates candidate sources; it does not measure Site-12 activation. The 13.48%
result below counts every Becoming and Intrusion tag before checking whether the concrete
result changes support/substrate in play. Becoming rows 3 and 7 are population-only, and the
audit did not classify Intrusion manifestations. The 18.03% disclosed screen is broader
still. Both are world-pressure ingredient rates. The narrower materialization-demand rate is
unmeasured.

## Door 1 — `dungeon-type` (the census's door)

Source read: `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Type.md`
(`id: dungeon-type`, `table_class: Fork`). Consumer: `src/engine/dungeon-walk.js:613`
(`walkPick("dungeon-type",1,3)`). Status: **`LIVE`**.

| d100 | archetype | original purpose | Site-12 reading |
|---:|---|---|---|
| 98 | The Megastructure | Anomaly / Ancient technology — "metallic corridors hum softly with impossible geometry" | substrate anomaly |
| 99 | The Megastructure | Anomaly / Ancient technology — "non-euclidean walls shift in faint mechanical rhythm" | substrate anomaly |
| 100 | The Living Hive | Biological growth / Nest — "pulsing walls breathe in warm, claustrophobic rhythm" | living substrate |

**Correction to the census, from reading the actual rows.** `walk-census.md` mapped *The
Megastructure* to Site 11 (Mixed-Scale/Dragon) and flagged it "genuinely ambiguous vs.
Site 12." The source rows settle it: the archetype's stated original purpose is **"Anomaly
/ Ancient technology"** and both atmosphere strings are about *geometry behaving wrongly*,
not about scale. Nothing in either row is titan-sized. **The Megastructure host requires
anomalous `SubstratePlan`.** It may also require `ScaleContract`; neither Golden number owns
the host.

That produces **3 rows (3%) with substrate-plan candidate content**, not a 3% activation
rate for a separate Site-12 generator. (Observed ≈ 2.0% on n=253 vs. 3.0% expected is
ordinary sampling noise at that n; the table share is only the candidate-source figure.)

**This table carries no Band column at all.** It is a Fork-class flat d100. So a Living
Hive or a Megastructure is exactly as likely in a Grounded baseline region as in a rim
region — the spice ladder does not gate this door in any way.

## Door 2 — `place-master-setting` (the settlement door)

Source read: `Engine/03. _Tables/01. World Building/Place Generation/Master Setting.md`
(`id: place-master-setting`, `table_class: Commitment`, spice-graded d100, full 5-band
ladder). Consumers: `src/creator/bardo.js:14` (the hometown beat, `key: ht_setting`) and
`src/engine/codex-roll.js:660`. Status: **`LIVE`**.

Substrate-relevant rows, **by band**:

| band | d100 | row | family |
|---|---:|---|---|
| Grounded | 4 | Mire-End — a village on stilts where seasonal floods have unearthed a burial mound | A / E |
| Grounded | 8 | Old Oak Wharf — a river trading post built entirely from the timber of a single gargantuan fallen tree | C (dead body as substrate) |
| Grounded | 15 | The Drowned Port — a coastal town where half the streets are only accessible during low tide | E |
| Grounded | 64 | The Ice-Road Town — a winter-only settlement on a frozen lake, complete with a temporary market | B / E |
| Textured | 67 | The Sunken Belfry — a lake-town where the drowned church's tower still breaks the surface | A / E |
| Textured | 72 | Twicebuilt — rebuilt one street east, so half its cellars open onto the first town's charred footprints | D (layered ground) |
| Strange | 87 | The Shimmering Maw — a village suspended by massive chains over a crater of fused, multicoloured glass | D |
| Strange | 89 | The Breathless Altar — an underwater bubble-city beneath a frozen ocean | D / E |
| Strange | 90 | The Dorsal Market — a trading hub on the spine of a gargantuan flying sky-whale | B + C |
| Strange | 92 | The Inverse Spire — a city that grows downward into a shaft of unknown depth | D |
| Strange | 93 | The Tide-That-Stopped — a coastal town caught mid-wave; the frozen water forms its walls, bridges, and cathedral ceiling | D / E |
| Volatile | 97 | The Gravity-Well — a forest whose trees grow toward a floating magnetic black stone | D / F |
| Volatile | 98 | The Living Tapestry — a city whose buildings are woven from sentient, self-repairing silk thread | C / F |
| Volatile | 99 | The Fracture-Market — built over a rift widening a hand-span each year; the oldest families own the bridging platforms | D / E |
| Mythic | 100 | Anvil-of-Morning — a town that wakes each dawn one street longer | F |

**15 of 100 rows are substrate-anomaly places, and they occupy every band from Grounded to
Mythic.** Four are Grounded. This is the empirical refutation of "Site 12 is the
Strange/Volatile/Mythic end" *as a statement about the noun*.

### A recorded discrepancy, not resolved here

`docs/intel/tiyl-starts.md` line 179 records Start 3's world-origin as
**"(d100=81, Textured): The Dorsal Market."** The source table places The Dorsal Market at
**d100 = 90, band Strange**; d100 = 81 is *The Indenture Town* (Textured). Under the
band-first rolling model in `SPICE-RAISE.md` a Textured band roll cannot land on a Strange
row, so the two cannot both be right.

Possible causes, none verified: the intel report transcribed the wrong index; the compiled
artifact disagrees with the markdown source; or the roll was recorded before a re-grade.
**Flagged as an open discrepancy for the TIYL lane.** Nothing in this packet or the Site 12
spec depends on which way it resolves — the row exists and is Strange in source either way.

## Door 3 — the world-genesis pressure chain (broad candidate pressure)

This is the largest source of Site-12 demand in the engine, and it is fully live.

**Source read.** `Engine/03. _Tables/01. World Building/Starting State/Starting State -
Pressures.md` (`id: starting-state-pressures`, `table_class: Commitment`) and its carved
runtime twin `data/starting-state.js` (`SS.pSource`, `SS.pInternal`, `SS.pExternal`,
`SS.pImpersonal`, `SS.cBecoming`, `SS.cIntrusion`, `SS.cIntrusionManifest`, `SS.cBuried`,
`SS.cCurse`, `SS_CONC`).

**Wiring verified by reading code, not assumed.**
- `src/engine/world-gen.js:29` — `rollStartingState()` does
  `w.pressures = [rollPressure("internal", w), rollPressure("external", w)]`.
  **Every fresh world rolls two pressures.**
- `src/engine/world-gen.js:15–23` — `rollPressure()` rolls `pSource`, then the kind table;
  if the source is impersonal it rolls `pImpersonal` and a tagged impersonal row overrides
  the tag; then `concretize(concTag)`.
- `src/engine/tables.js:12–18` — `concretize()` maps the tag through
  `SS_CONC = {buried:"cBuried", intrusion:"cIntrusion", becoming:"cBecoming", curse:"cCurse"}`
  and rolls the concrete table; intrusion additionally appends a `cIntrusionManifest` roll.
- `src/engine/world-gen.js:37–39` — the result is written to the **World State Ledger** as
  `drift`, carrying `real.text` as DM-only truth.

So the routing note in the markdown — *Internal 20 (the town becomes something else) and
Impersonal 12 (a slow change in the land) → **The Becoming*** — is not aspirational
documentation. It executes.

### The measurement

`substrate-demand-measure.mjs` (in this packet) loads the real `data/starting-state.js` and
replays `rollPressure()`'s exact tag path over N worlds. Run at the repo root,
`node v22.15.0`, N = 200,000:

```
concretize-tag counts over 400000 pressures:
  { buried: 19740, curse: 9872, beast: 9554, intrusion: 9765, becoming: 18147 }
cBecoming row spread (d8, 2231–2293 per row — flat, as authored)
P(world commits >=1 becoming/intrusion tag)            = 13.48%
P(world commits >=1 broad candidate concrete row)       = 18.03%
```

An independent closed-form enumeration over the same row ranges gives **13.47%** and
**17.98%** — the two methods agree to within Monte-Carlo noise, so the number is not a
harness artefact.

> **≈ 1 world in 7 (13.5%) commits at least one Becoming or Intrusion tag at world genesis.**
> This is not an unambiguous substrate-transform or Site-12 materialization rate. The
> disclosed broad concrete-row screen is ≈18%; both require narrower semantic classification
> before they can drive a map.

The `cBecoming` d8 spread is flat by authorship, so each of its eight outcomes lands on
~1.7% of all worlds:

| d8 | The place is becoming… | substrate reading |
|---:|---|---|
| 1 | a single substance — glass, stone, metal, salt, fungus, or silk — creeping from a source | **D**, and this is the Shimmering Maw's mechanism exactly |
| 2 | a place out of time; hours loop, age, or freeze | F |
| 3 | a hive or chorus, the people becoming one mind | C (population, not ground — flagged) |
| 4 | an echo of its own myth, reshaping into the story it tells | F |
| 5 | a garden of something, a spore rewriting flesh and timber | C |
| 6 | a place where the rules slip — gravity, sound, colour, direction | F |
| 7 | a town of replacements, each resident slowly swapped | C (population, not ground — flagged) |
| 8 | a wound still spreading from something that already happened here | D |

Rows 3 and 7 change the *population*, not the substrate. Their inclusion is exactly why
13.48% cannot be called Site-12 demand. Intrusion manifestations also remain unevaluated.

## Door 4 — the marathon's thematic-only hits

`intel/marathon-spatial-mining.md` logs 2 thematic Site-12 findings across 11 transcripts
and is explicit that it counted them as thematic **only**: the Shimmering Maw's crater and
the fog-contagion "read as a place that is itself alive/hungry… but neither is ever staged
as a buildable scene with rooms, props, or a floor plan." That honesty is correct and this
packet does not upgrade it.

What the marathon *does* prove is adjacent and load-bearing: its §4 lists a
**flood/drowning disaster site** as a standing demand with no home ("recurs across four
separate sets as the actual engine of danger and consequence; nothing in the twelve sites
models it"), and its ranked list puts **elevation + unstable terrain as tactical ground**
second of eight with "very high load-bearing," noting two sets independently invented the
same trick — bait an enemy onto a narrow unstable edge and let the terrain kill.

Unstable-edge-as-weapon is a Site-12 mechanic wearing a Site-anything skin.

## Door 5 — TIYL starts

`intel/tiyl-starts.md`, 12 rolled character starts:

- **The Drowned Port ×3** — the single most-rolled `bornWhere` in the batch, mapped by the
  report to "**none** — no golden site is a working waterfront/port town." It is family E.
- **The Dorsal Market ×1** — "partial: the physical conceit (living-creature architecture)
  has no precedent in any of the twelve."
- **The Shimmering Maw ×1** — "**gap** — pure spectacle/wonder register, no precedent."

**5 of 12 starts (42%) opened on a substrate-plan candidate setting.** This small sample
demonstrates breadth, not activation frequency or ownership by a Golden number.

## Door 6 — the footing tables (already authored, half-delivered)

Found by reading table source rather than assuming a gap.

### `wilderness-footing` (d200, Spark) — **`LIVE`, column-truncated**

Consumer verified: `src/engine/wild-walk.js:182`, `walkPick("wilderness-footing", 1)`.

The table has three data columns — *Surface Flavor* · *Coverage Area* · *Mechanical Impact
& Tracking* — and the call takes **column 1 only**. Columns 2 and 3 are discarded at the
consumption boundary.

What is being discarded is precisely Site 12's mechanics:

| d200 | row | coverage | mechanical impact (column 3, currently unread) |
|---:|---|---|---|
| 144 | Thin Ice / Fragile Crust | One 20×20 patch | **"Breaks if weight exceeds 3d10×10 lbs in a 10-ft square; fall through."** |
| 159 | Thin Ice / Fragile Crust | 1d4 10×10 patches | same |
| 174 | Thin Ice / Fragile Crust | 25% of Area | same |
| 189 | Thin Ice / Fragile Crust | Outer Perimeter | same |
| 148 / 163 / 178 / 193 | Deep Bog / Thick Tar | 20×20 patch · 10-ft strip · 1d4 10×10 · Outer Perimeter | "Costs 4 squares of movement to enter. Grants cover but imposes Disadvantage to melee." |
| 095 / 115 / 135 | Foul Bog / Stagnant Peat | 100% · 20×20 patch · 50% of Area | Difficult Terrain |

**A rolled load limit per 10-ft square is the load-band relation, already authored.** The
Coverage Area column is the perimeter-and-patch vocabulary a Site-12 anomaly needs
(`One 20x20 patch`, `Outer Perimeter`, `10-foot wide strip`, `25% of Area`), already
authored 200 rows deep.

### `urban-footing` (d100, Spark) — **`ORACLE-MANUAL`**

No code consumer. `grep -rn '"urban-footing"' src/` returns nothing; the only reference is
`Engine/02. _Procedures/Urban Encounter v2.5.md`. (`data/table-usage.js` marks it `WIRED`
with `consumers.code: ["table-atlas.js"]` — but `table-atlas.js` is a generated index, not a
caller. The usage classification and the code disagree; the code is authoritative here.)

Unreachable rows that author the trusted-path grammar outright:

| d100 | row | why it matters |
|---:|---|---|
| 31–32 | Sturdy Boardwalk (100% / 5-ft path) | the trusted path, and it is *loud* — Disadvantage on Stealth when Dashing |
| 33–34 | Rotting Boardwalk (100% / 10×10 patch) | the path fails under bludgeoning/thunder or AoE — Restrained, or a 10-ft pit |
| 35 | Missing Planks (scattered 5×5 gaps) | DC 12 Acrobatics at speed or fall through |
| 39 | Makeshift Plank (5-ft bridge) | a thin beam over a chasm |
| 18 / 23 / 24 | Deep Mud · Shallow Water · Flooded Street | the cyclic/low-datum surface set |

### Why this matters more than a wiring note

Site 12's spec would otherwise have proposed *inventing* a load system and a trusted-path
failure grammar. Both exist. The honest adapter job is **read the columns and route the
urban table**, not build a parallel model — which is exactly the preservation ledger's
governing rule ("preserve the factorized ability to produce the result").

This is a **spawn-audit finding**, recorded in `docs/intel-sites/SITE-12-SPAWNABLE.md`. It
belongs to whichever lane owns the walk consumption boundary. The Site 12 spec may not
change `wild-walk.js`.

### A methodology note against myself

My first grep for `footing` in `src/` was piped through `head -10` and returned only
`theater-room-mesh.js` hits (an unrelated masonry term), from which I nearly concluded that
*neither* footing table was wired. A second, exact grep on the quoted table id found
`wild-walk.js:182`. **Read the actual files before claiming a gap** — the near-miss is
recorded because the false version of this finding would have been more dramatic and
completely wrong.

## Candidate-source summary — all doors

| door | status | measured candidate supply | evidence |
|---|---|---|---|
| world-genesis pressures (Becoming / Intrusion) | `LIVE` | **13.5% of worlds with either tag** (18% broad candidate screen) | measured, this packet; activation unmeasured |
| `place-master-setting` | `LIVE` | **15 of 100 rows**, all five bands | source read |
| TIYL opening scenes | `LIVE` | **5 of 12 rolled starts** | `intel/tiyl-starts.md` |
| `dungeon-type` | `LIVE` | **3 of 100 rows** (census read 1 of 100) | source read + census |
| marathon play demand | — | 2 thematic, 0 structural; plus an unhomed flood-site demand | `intel/marathon-spatial-mining.md` |
| `wilderness-footing` | `LIVE` (columns 2–3 discarded) | 200 rows incl. rolled load limits and coverage geometries | source read + consumer read |
| `urban-footing` | `ORACLE-MANUAL` (no code consumer) | 100 rows incl. the whole boardwalk/plank failure grammar | source read + exhaustive grep |

The census's 1.2% was the smallest door, measured correctly, and mistaken for the site.

## Honest limits of this lane

- The 13.48% figure measures **which tags world genesis commits**, not which concrete results
  change substrate and not what a player is shown. A committed Becoming may be population-only
  or may never be materialised as a scene. The spec must not claim Site-12 or player-facing
  frequency from this number.
- `SUBSTRATE_ROWS` in the measurement script is **my classification**, disclosed in the
  script and here. The underlying tag counts are exact; the substrate label on each
  concrete row is a judgement.
- I did not roll walks for this lane. The `dungeon-type` share is a table-share figure; the
  census's rolled figure is the observed one and both are stated.
- No claim here has been through clay or play. Every number is a *demand* number, and
  demand does not authorise a build.
