---
type: research-artifact
project: Genesis
status: GENERATED — do not hand-edit; regenerate with `node dev/research/extract-tactical-bands.mjs`
spec: docs/TACTICAL-PROMISE-GATE.md §2 T1
source: Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv
counting-rule authority: Reference/FFT-Triangle-Strategy-World-Study/lane-1-footprint-topology-pacing.md
---

# Tactical promise bands (T1)

Measured FFT-corpus (and pooled FFT+TS) distributions for the eight tactical metrics of
TACTICAL-PROMISE-GATE §1, per size class, for the T2 gate harness to assert against.
Committed truth: `docs/intel/tactical-promise-bands.json` (same generator, same run).

## Row accounting (matches the CSV)

- CSV data rows: **45** (header excluded) — all parsed; per-game: FFT 12 · TriangleStrategy 12 · Genesis 12 · IvaliceChronicles 9.
- Band-eligible corpus rows: **24** (FFT 12 + TriangleStrategy 12) — the parsed-values appendix below lists every one.
- Band-excluded rows: **21** (Genesis 12 + IvaliceChronicles 9) — parsed and accounted for, listed below with reasons; never silently dropped.
- 24 + 21 = 45. ✔

### Excluded rows (parse-included, band-excluded)

| game | mapName | reason (summary) |
|---|---|---|
| Genesis | scale-pass target: Site-02 Camp small (Roadside Sleep-and-Fire Stop) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | engine capture: CL-F09 FFT hillside proof | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-02 Camp medium (Borrowed-Clearing Camp) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-12 Substrate small (Bog Crossing) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | DECLARED GAP — no Genesis snow/ice target or capture exists yet | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-10 Urban medium (Market-Hall Slice) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-09 Fortress small (Rising Gate Window) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-04 Monastery medium (Level Wrapped Court) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-05 Mine medium (Strained Drift) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | engine capture: CL-F05 trimmed structures (production renderer) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-09 large-site vignette (Contested Wall Stair) | subject-under-test design-intent/fixture row, not corpus evidence |
| Genesis | scale-pass target: Site-03 Dormant small (Stopped Guard Shelter) | subject-under-test design-intent/fixture row, not corpus evidence |
| IvaliceChronicles | Mandalia Plain (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Sweegy Woods / Siedge Weald (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Zeirchele Falls (Enhanced + Classic PAIR) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Ziekden Fortress (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Merchant City of Dorter (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Lionel Castle Gate (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Orbonne Monastery (Enhanced + Classic PAIR) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Riovanes Castle Roof (Enhanced) | alias row — tactical cells read "as FFT (same board)"; no independent values |
| IvaliceChronicles | Sand Rat's Sietch (Enhanced; ID medium-high confidence) | alias row — tactical cells read "as FFT (same board)"; no independent values |

Full reasons:

- **Genesis (12 rows):** subject-under-test rows (design intents / engine fixtures), not tactics-corpus evidence; cells are design-intent prose, and the DECLARED GAP row carries em-dash placeholders.
- **IvaliceChronicles (9 rows):** alias rows — every tactical cell reads "as FFT (same board)" (no independent values); 3 of 9 (Lionel Castle Gate, Riovanes Castle Roof, Sand Rat's Sietch) alias boards that are not among the 12 measured FFT rows, and resolving the other 6 would only double-weight FFT boards in the pooled band.

## Size classes (terciles of traversableCellEstimate)

Terciles are computed **per grouping** over that grouping's own rows (DERIVED rule below),
so every class is non-empty in both groupings. A row's class can therefore differ between
groupings (e.g. Grog Hill: fftOnly **large**, pooled **medium**) — each is true inside its
own grouping, and T2 must use the edge set of whichever grouping §5 Q1's ruling picks.

### fftOnly (n=12)

- Edges: **small ≤ 67.5 · medium 67.5–92.5 · large > 92.5** (driver min 47.5, max 130).
- small (n=4): Zirekile Falls · Dorter Trade City · Goug Machine City · Inside of Windmill Shed
- medium (n=4): Fort Zeakden · At Main Gate of Igros Castle · Orbonne Monastery · Bervenia Free City
- large (n=4): Mandalia Plains · Grog Hill · Sweegy Woods · Underground Book Storage Fifth Floor

### pooled (n=24)

- Edges: **small ≤ 92.5 · medium 92.5–240 · large > 240** (driver min 47.5, max 425).
- small (n=8): Zirekile Falls · Fort Zeakden · Dorter Trade City · At Main Gate of Igros Castle · Orbonne Monastery · Goug Machine City · Bervenia Free City · Inside of Windmill Shed
- medium (n=9): Mandalia Plains · Grog Hill · Sweegy Woods · Underground Book Storage Fifth Floor · Norzelia green field · Whiteholm bridge gate · Wolffort great hall — NON-HOMOLOGOUS interior slot (no roofed-interior battle frame in TS; declared) · Telliore reservoir dam · Norzelia dry steppe (sparse control)
- large (n=7): Falkes wheat terraces · Roselle village — NON-HOMOLOGOUS forest slot (no dense-forest battle in TS; declared absence) · Twinsgate fortress (snow) · Wolffort Streets (Ch VII town defense) · Glenbrook capital ramparts · Hyzante Goddess court · Grand Norzelia mine

## Bands

Values carry the midpoint marks of the appendix (`*` midpoint, `~` approximate, `†` special
case) only in the appendix; band stats below are computed over the parsed values. The
`all` block is the whole grouping (the §5 Q1 side-by-side view); small/medium/large are
the per-class bands T2 asserts against.

### Grouping: fftOnly — FFT rows only (unit-clean)

#### fftOnly / all (n=12)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 47.5 | 58 | 85 | 127.75 | 130 | 12 |
| elevationBandCount | 2 | 2 | 3 | 4 | 5 | 12 |
| maxConsequentialElevationDelta | 2 | 2.5 | 5 | 7.5 | 9.5 | 12 |
| majorRouteCount | 1 | 1 | 1 | 1.9 | 2 | 12 |
| alternateRouteCount | 0 | 0 | 1 | 1 | 2 | 12 |
| shortLoopCount | 0 | 0 | 1 | 1 | 1 | 12 |
| chokepointCount | 0 | 1 | 1 | 2 | 2 | 12 |
| reachableHighGroundCount | 1 | 1.1 | 3 | 5 | 6 | 12 |
| spawnToFirstDecisionCells | 2 | 2.5 | 2.5 | 3.5 | 3.5 | 12 |

Rows: Mandalia Plains · Grog Hill · Sweegy Woods · Zirekile Falls · Fort Zeakden · Dorter Trade City · At Main Gate of Igros Castle · Orbonne Monastery · Goug Machine City · Underground Book Storage Fifth Floor · Bervenia Free City · Inside of Windmill Shed

#### fftOnly / small (n=4)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 47.5 | 50.5 | 60 | 66 | 67.5 | 4 |
| elevationBandCount | 2 | 2.3 | 3.5 | 4 | 4 | 4 |
| maxConsequentialElevationDelta | 2 | 2.6 | 5.25 | 7.2 | 7.5 | 4 |
| majorRouteCount | 1 | 1 | 1 | 1 | 1 | 4 |
| alternateRouteCount | 0 | 0 | 0.5 | 1.7 | 2 | 4 |
| shortLoopCount | 0 | 0 | 0.5 | 1 | 1 | 4 |
| chokepointCount | 1 | 1 | 1 | 1 | 1 | 4 |
| reachableHighGroundCount | 1 | 1.3 | 3.5 | 5 | 5 | 4 |
| spawnToFirstDecisionCells | 2 | 2.15 | 2.5 | 2.5 | 2.5 | 4 |

Rows: Zirekile Falls · Dorter Trade City · Goug Machine City · Inside of Windmill Shed

#### fftOnly / medium (n=4)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 77.5 | 79 | 85 | 91 | 92.5 | 4 |
| elevationBandCount | 3 | 3 | 3.5 | 4.7 | 5 | 4 |
| maxConsequentialElevationDelta | 4.5 | 4.95 | 6.75 | 8.9 | 9.5 | 4 |
| majorRouteCount | 1 | 1 | 1 | 1.7 | 2 | 4 |
| alternateRouteCount | 0 | 0.3 | 1 | 1 | 1 | 4 |
| shortLoopCount | 0 | 0 | 0.5 | 1 | 1 | 4 |
| chokepointCount | 1 | 1 | 1.5 | 2 | 2 | 4 |
| reachableHighGroundCount | 3 | 3 | 3.5 | 5.4 | 6 | 4 |
| spawnToFirstDecisionCells | 2.5 | 2.5 | 3 | 3.5 | 3.5 | 4 |

Rows: Fort Zeakden · At Main Gate of Igros Castle · Orbonne Monastery · Bervenia Free City

#### fftOnly / large (n=4)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 102.5 | 104 | 118.75 | 130 | 130 | 4 |
| elevationBandCount | 2 | 2 | 2 | 3.4 | 4 | 4 |
| maxConsequentialElevationDelta | 2.5 | 2.5 | 2.75 | 4.75 | 5.5 | 4 |
| majorRouteCount | 1 | 1 | 1 | 1.7 | 2 | 4 |
| alternateRouteCount | 1 | 1 | 1 | 1 | 1 | 4 |
| shortLoopCount | 0 | 0.3 | 1 | 1 | 1 | 4 |
| chokepointCount | 0 | 0.3 | 1 | 1.7 | 2 | 4 |
| reachableHighGroundCount | 1 | 1.3 | 2.5 | 3.7 | 4 | 4 |
| spawnToFirstDecisionCells | 2.5 | 2.8 | 3.5 | 3.5 | 3.5 | 4 |

Rows: Mandalia Plains · Grog Hill · Sweegy Woods · Underground Book Storage Fifth Floor

### Grouping: pooled — FFT + TriangleStrategy (delta metric mixes unit systems; see DERIVED)

#### pooled / all (n=24)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 47.5 | 64 | 157.5 | 270 | 425 | 24 |
| elevationBandCount | 2 | 2 | 3 | 4 | 5 | 24 |
| maxConsequentialElevationDelta | 2 | 2.65 | 6 | 10 | 32 | 24 |
| majorRouteCount | 1 | 1 | 1 | 1.7 | 2 | 24 |
| alternateRouteCount | 0 | 0.3 | 1 | 2 | 2 | 24 |
| shortLoopCount | 0 | 0 | 1 | 1 | 1 | 24 |
| chokepointCount | 0 | 0.3 | 1 | 2 | 2 | 24 |
| reachableHighGroundCount | 1 | 1.3 | 3 | 5 | 6 | 24 |
| spawnToFirstDecisionCells | 2 | 2 | 2 | 3.5 | 3.5 | 24 |

Rows: Mandalia Plains · Grog Hill · Sweegy Woods · Zirekile Falls · Fort Zeakden · Dorter Trade City · At Main Gate of Igros Castle · Orbonne Monastery · Goug Machine City · Underground Book Storage Fifth Floor · Bervenia Free City · Inside of Windmill Shed · Norzelia green field · Falkes wheat terraces · Roselle village — NON-HOMOLOGOUS forest slot (no dense-forest battle in TS; declared absence) · Whiteholm bridge gate · Twinsgate fortress (snow) · Wolffort Streets (Ch VII town defense) · Glenbrook capital ramparts · Hyzante Goddess court · Grand Norzelia mine · Wolffort great hall — NON-HOMOLOGOUS interior slot (no roofed-interior battle frame in TS; declared) · Telliore reservoir dam · Norzelia dry steppe (sparse control)

#### pooled / small (n=8)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 47.5 | 54.5 | 72.5 | 89 | 92.5 | 8 |
| elevationBandCount | 2 | 2.7 | 3.5 | 4.3 | 5 | 8 |
| maxConsequentialElevationDelta | 2 | 3.4 | 6.25 | 8.1 | 9.5 | 8 |
| majorRouteCount | 1 | 1 | 1 | 1.3 | 2 | 8 |
| alternateRouteCount | 0 | 0 | 1 | 1.3 | 2 | 8 |
| shortLoopCount | 0 | 0 | 0.5 | 1 | 1 | 8 |
| chokepointCount | 1 | 1 | 1 | 2 | 2 | 8 |
| reachableHighGroundCount | 1 | 1.7 | 3.5 | 5.3 | 6 | 8 |
| spawnToFirstDecisionCells | 2 | 2.35 | 2.5 | 3.5 | 3.5 | 8 |

Rows: Zirekile Falls · Fort Zeakden · Dorter Trade City · At Main Gate of Igros Castle · Orbonne Monastery · Goug Machine City · Bervenia Free City · Inside of Windmill Shed

#### pooled / medium (n=9)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 102.5 | 106.5 | 185 | 240 | 240 | 9 |
| elevationBandCount | 2 | 2 | 2 | 4.2 | 5 | 9 |
| maxConsequentialElevationDelta | 2.5 | 2.5 | 3 | 11.2 | 32 | 9 |
| majorRouteCount | 1 | 1 | 1 | 2 | 2 | 9 |
| alternateRouteCount | 1 | 1 | 1 | 1.2 | 2 | 9 |
| shortLoopCount | 0 | 0 | 0 | 1 | 1 | 9 |
| chokepointCount | 0 | 0 | 1 | 2 | 2 | 9 |
| reachableHighGroundCount | 1 | 1 | 2 | 4.2 | 5 | 9 |
| spawnToFirstDecisionCells | 2 | 2 | 2 | 3.5 | 3.5 | 9 |

Rows: Mandalia Plains · Grog Hill · Sweegy Woods · Underground Book Storage Fifth Floor · Norzelia green field · Whiteholm bridge gate · Wolffort great hall — NON-HOMOLOGOUS interior slot (no roofed-interior battle frame in TS; declared) · Telliore reservoir dam · Norzelia dry steppe (sparse control)

#### pooled / large (n=7)

| metric | min | p10 | median | p90 | max | n |
|---|---|---|---|---|---|---|
| _traversableCellEstimate (driver)_ | 250 | 250 | 270 | 332 | 425 | 7 |
| elevationBandCount | 3 | 3 | 4 | 4 | 4 | 7 |
| maxConsequentialElevationDelta | 5 | 5.6 | 10 | 10 | 10 | 7 |
| majorRouteCount | 1 | 1 | 1 | 1 | 1 | 7 |
| alternateRouteCount | 1 | 1 | 2 | 2 | 2 | 7 |
| shortLoopCount | 0 | 0 | 1 | 1 | 1 | 7 |
| chokepointCount | 1 | 1 | 2 | 2 | 2 | 7 |
| reachableHighGroundCount | 3 | 3 | 4 | 4.4 | 5 | 7 |
| spawnToFirstDecisionCells | 2 | 2 | 2 | 2 | 2 | 7 |

Rows: Falkes wheat terraces · Roselle village — NON-HOMOLOGOUS forest slot (no dense-forest battle in TS; declared absence) · Twinsgate fortress (snow) · Wolffort Streets (Ch VII town defense) · Glenbrook capital ramparts · Hyzante Goddess court · Grand Norzelia mine

## Lane-1 counting rules (quoted — T2 inherits these beside each metric implementation)

Authority: `Reference/FFT-Triangle-Strategy-World-Study/lane-1-footprint-topology-pacing.md` (its line 3 names the row-level source: "Data: `data/MEASUREMENTS.csv` (row-level)").

### traversableCellEstimate (size-class driver)

> §1.1: "Measured (28 px/tile top-down renders, cross-checked against FFHacktics data grids; 40/48 exact agreement, 8 cases where the data grid carries 1–2 unrendered edge columns — both figures recorded)"
> §1.3: "FFT: measured non-void share of the top-down envelope: 60–95% by map (CSV per-row); the remainder is *composed void*, not world — beyond the edge is black."
> §1.2 (TS method): "No public per-tile data exists (declared measurement limit). From full-map deploy renders with visible grid patches + unit-height scale reference (sprite ≈ 1 tile)"

### elevationBandCount

> §1.7: "FFT cohort: 2–5 bands; every reachable band is contestable (height = attack/defense + range mechanics per the Aerostar BMG, 783K-char local copy); scenery-only verticals are clearly nonwalkable (spires, church towers, tree crowns)."

### maxConsequentialElevationDelta

> lane-1 states NO dedicated counting rule for this column (flagged per gate G3 — nothing to inherit beyond §1.7's consequential-vs-decorative frame, quoted above). The CSV cells carry their own unit annotations: FFT "(FFT h-units, visual est)", TS "units". The two unit systems are NOT comparable — see DERIVED notes.

### majorRouteCount

> §1.8: "primary routes 1 (Mandalia's open field = 2–3 broad approaches)"
> §1.8: "**The shape is: one spine, one licensed alternate, one constraint**"
> lane-1 states NO cell-share distinctness rule; the spec §2 T2 "≤30% shared cells" rule stays DERIVED (spec-origin), uncontradicted by lane-1.

### alternateRouteCount

> §1.8: "alternates 0–2"

### shortLoopCount

> §1.8: "short loops 0–1"

### chokepointCount

> §1.8: "chokepoints 0–2 (gates/bridges)"

### reachableHighGroundCount

> §1.8: "reachable high grounds 1–6; scenery masses 1–8"
> §1.7 (the reachable-vs-scenery split): "scenery-only verticals are clearly nonwalkable (spires, church towers, tree crowns)" — the CSV keeps the scenery side in its own column, sceneryOnlyHighMassCount.

### spawnToFirstDecisionCells

> §1.4: "FFT (cohort views + documented starts): party spawns at a board edge; enemies visible immediately; first branch (route/height choice) within **2–4 cells**."
> §1.4: "TS (Wolffort deploy render): deploy tiles abut the contested street; first choice (street vs stair-to-roofs) is **1–3 cells** out."

## DERIVED rules (everything that is interpretation, not measurement)

1. **Midpoint rule.** A cell's LEADING numeric token is the value: `3-4` → 3.5; `2-3h` →
   strip trailing unit letters, then midpoint → 2.5; `120-140 (visual; envelope 156)` →
   leading range only → 130; `~200-280 (est)` → 240, with the leading `~` recorded as
   approximate. Parentheticals are annotation, never value. Midpointed values are tagged
   DERIVED in the appendix (`*`); untouched integers are MEASURED as recorded.
2. **Quantile rule.** p10/median/p90 by linear interpolation between order statistics
   (type R-7, the numpy/Excel default): q(p) = s[(n−1)p] interpolated; min/max exact.
3. **Tercile rule.** Per grouping over its own driver values: e1 = ceil(n/3)-th smallest,
   e2 = ceil(2n/3)-th smallest; small v ≤ e1, medium e1 < v ≤ e2, large v > e2; equal
   driver values always share a class (no name tie-breaks). Computed per grouping because
   a single pooled edge set would leave fftOnly's large class EMPTY (every FFT row except
   the two 130s sits below the pooled e1) and empty classes would put NaN in bands (G1).
   Resulting edges — fftOnly: e1 67.5, e2 92.5; pooled: e1 92.5, e2 240.
4. **Row exclusions (by game, every row listed above).** Genesis rows are the subject under
   test (design intents / fixtures; the "DECLARED GAP — no Genesis snow/ice target or
   capture exists yet" row carries em-dash placeholders in every consumed column and is the
   canonical resists-parsing row — excluded at the game level before cell parsing, so no
   invented values). IvaliceChronicles rows alias FFT boards ("as FFT (same board)") with
   no independent numbers; three alias boards absent from the measured FFT set.
5. **Special-cased cells (by mapName):**
   - **Telliore reservoir dam** / `maxConsequentialElevationDelta`: raw cell begins `'Height 32' HUD documented —…` — cell is prose, not a range: the study recorded the HUD reading 'Height 32' — TS fine height units, an absolute tile height documented as evidence of a large delta, not a measured delta, and incomparable to FFT h-units. Parsed as 32 so the pooled grouping SHOWS the unit clash instead of hiding the row; the fftOnly grouping is unaffected.
6. **Unit caveat (pooled delta).** `maxConsequentialElevationDelta` pools FFT h-units with
   TS "units"/fine HUD units. fftOnly delta bands are unit-clean; pooled delta bands are
   emitted for the §5 Q1 side-by-side ruling but are NOT unit-normalized — the pooled
   medium-class max of 32 is the Telliore special case showing through, on purpose.
7. **Flag for T2 (spec-vs-CSV discrepancy).** Spec §3 G2's Grog Hill MAP081 example
   ("2-3 bands, 5-6h delta, 1 major + 1 alternate, 2 loops, 4 chokepoints") disagrees with
   the CSV row: spawn 2-3 · bands 4 · delta 5-6h · 1 major · 1 alternate · **1 loop** ·
   **2 chokepoints** · 4 reachable high grounds. The spec line appears column-shifted.
   MEASUREMENTS.csv is the row-level authority; T2's GREEN fixture must be translated
   from the CSV row, not the spec prose.
8. **Flag for T2 (rules lane-1 does NOT state).** No lane-1 counting rule exists for
   `maxConsequentialElevationDelta` (only §1.7's consequential-vs-decorative frame), and
   no route cell-share distinctness rule exists (the spec's ≤30% stays DERIVED). Gate G3:
   flag, don't invent; lane-1 wins if it ever states one.

## Appendix — parsed values per corpus row (MEASURED vs DERIVED provenance)

Marks: unmarked = MEASURED integer as recorded · `*` = DERIVED midpoint of a recorded
range · `~` = recorded as approximate in the CSV · `†` = special case (see DERIVED §5).
Raw cell text is preserved verbatim in the JSON (`rows[].cells[].raw`). Confidence is the
CSV tag, passed through verbatim.

| game | mapName | class (fft/pooled) | trav | elevBands | maxDelta | major | alt | loops | chokes | reachHigh | spawn→dec | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FFT | Mandalia Plains | large/medium | 130* | 2 | 2.5* | 2 | 1 | 1 | 0 | 3 | 3.5* | high |
| FFT | Grog Hill | large/medium | 102.5* | 4 | 5.5* | 1 | 1 | 1 | 2 | 4 | 2.5* | high |
| FFT | Sweegy Woods | large/medium | 107.5* | 2 | 3 | 1 | 1 | 0 | 1 | 2 | 3.5* | high |
| FFT | Zirekile Falls | small/small | 62.5* | 3 | 4 | 1 | 0 | 0 | 1 | 2 | 2.5* | high |
| FFT | Fort Zeakden | medium/small | 77.5* | 4 | 7.5* | 1 | 1 | 1 | 2 | 4 | 3.5* | high |
| FFT | Dorter Trade City | small/small | 67.5* | 4 | 6.5* | 1 | 2 | 1 | 1 | 5 | 2.5* | high |
| FFT | At Main Gate of Igros Castle | medium/small | 87.5* | 3 | 6 | 1 | 0 | 0 | 2 | 3 | 3.5* | high |
| FFT | Orbonne Monastery | medium/small | 92.5* | 3 | 4.5* | 1 | 1 | 0 | 1 | 3 | 2.5* | high |
| FFT | Goug Machine City | small/small | 57.5* | 4 | 7.5* | 1 | 1 | 1 | 1 | 5 | 2.5* | high |
| FFT | Underground Book Storage Fifth Floor | large/medium | 130* | 2 | 2.5* | 1 | 1 | 1 | 1 | 1 | 3.5* | medium |
| FFT | Bervenia Free City | medium/small | 82.5* | 5 | 9.5* | 2 | 1 | 1 | 1 | 6 | 2.5* | high |
| FFT | Inside of Windmill Shed | small/small | 47.5* | 2 | 2 | 1 | 0 | 0 | 1 | 1 | 2 | high |
| TriangleStrategy | Norzelia green field | —/medium | 240*~ | 2 | 3*~ | 2 | 1 | 0 | 0 | 2 | 2* | medium |
| TriangleStrategy | Falkes wheat terraces | —/large | 270*~ | 4 | 8*~ | 1 | 2 | 1 | 1 | 4 | 2* | medium-high |
| TriangleStrategy | Roselle village — NON-HOMOLOGOUS forest slot (no dense-forest battle in TS; declared absence) | —/large | 250~ | 3 | 5*~ | 1 | 2 | 1 | 1 | 3 | 2* | medium |
| TriangleStrategy | Whiteholm bridge gate | —/medium | 185*~ | 3 | 6*~ | 1 | 1 | 0 | 2 | 3 | 2* | medium |
| TriangleStrategy | Twinsgate fortress (snow) | —/large | 250*~ | 4 | 10*~ | 1 | 1 | 1 | 2 | 4 | 2* | medium |
| TriangleStrategy | Wolffort Streets (Ch VII town defense) | —/large | 425*~ | 4 | 10*~ | 1 | 2 | 1 | 2 | 5 | 2* | medium-high |
| TriangleStrategy | Glenbrook capital ramparts | —/large | 270*~ | 4 | 10*~ | 1 | 1 | 0 | 2 | 4 | 2* | medium |
| TriangleStrategy | Hyzante Goddess court | —/large | 260*~ | 3 | 6*~ | 1 | 1 | 0 | 1 | 3 | 2* | medium |
| TriangleStrategy | Grand Norzelia mine | —/large | 270*~ | 4 | 10*~ | 1 | 2 | 1 | 2 | 4 | 2* | medium-high |
| TriangleStrategy | Wolffort great hall — NON-HOMOLOGOUS interior slot (no roofed-interior battle frame in TS; declared) | —/medium | 185*~ | 2 | 3*~ | 1 | 1 | 0 | 1 | 2 | 2* | low-medium |
| TriangleStrategy | Telliore reservoir dam | —/medium | 240*~ | 5 | 32† | 1 | 2 | 1 | 2 | 5 | 2* | medium-high |
| TriangleStrategy | Norzelia dry steppe (sparse control) | —/medium | 215*~ | 2 | 3*~ | 1 | 1 | 0 | 0 | 1 | 2* | medium |

Appendix rows: 24 · excluded rows listed above: 21 · total = 45 = CSV data rows. ✔

