# Lane 1 — Footprint, topology, pacing, and tactical height

Answers §5.1 + §5.2. Data: `data/MEASUREMENTS.csv` (row-level), the 121-map measured set
(`local-captures/fft-original/fft-grid-dimensions.csv`), FFHacktics per-tile grids (48 maps,
Wayback URLs in `local-captures/fft-ledger.json`), TS full-map renders + gameplay frames
(29 map folders), Genesis targets/fixtures.

## 1.1 FFT playable dimensions — exact, whole game (§5.1 Q1)

Measured (28 px/tile top-down renders, cross-checked against FFHacktics data grids; 40/48
exact agreement, 8 cases where the data grid carries 1–2 unrendered edge columns — both
figures recorded):

- **envelope area: min 45 · median 120 · max 225 cells (15×15 Public Cemetery)**
- **longest side: min 8 · median 12 · max 18 (Zeklaus Desert 10×18)**
- cohort spread: Windmill interior 7×8=56 → Book Storage 5F 12×15=180

**The "16×16" claim, verified and delimited:** the 1997 Famitsu interviewer states combat
"takes place in a 16×16 map"; Matsuno answers with the *reason* — 60fps cursor/scroll UI
("If we had dropped that to 30fps, we could have had larger maps, but the controls would
have been degraded"). So 16×16 was the nominal working envelope; shipped maps never reach
16×16=256 cells of area (max 225), while one dimension does reach 18. **VERIFIED as a
design budget; CONTRADICTED as a literal shipped-map size.**

## 1.2 Triangle Strategy dimensions — best estimates (§5.1 Q2)

No public per-tile data exists (declared measurement limit). From full-map deploy renders
with visible grid patches + unit-height scale reference (sprite ≈ 1 tile):

- Wolffort Streets: ~22–26 × ~16–20 (≈ 350–500 cells) — method: house footprints (3–4
  tiles/gable) + deploy-tile patch scaling; confidence medium
- canal/plaza and courtyard maps: ~18–24 per side typical read
- sparse steppe/field maps read smaller (~16–20 per side)

**Estimate: TS battle boards run ≈1.5–2.5× FFT's median area, and roughly 1.5–2× FFT's
maximum.** They stay far below XCOM-class acreage: a TS map is still one readable diorama
in frame — the interviewer's own "diorama or vignette-like object" perception (4Gamer).

## 1.3 Playable floor vs scenic envelope (§5.1 Q3)

- FFT: measured non-void share of the top-down envelope: 60–95% by map (CSV per-row); the
  remainder is *composed void*, not world — beyond the edge is black.
- TS: the frame carries **more world than board** — walls, continuing streets, cliff faces,
  water, blurred far fabric (canal-night frame: the board occupies roughly the middle
  half; the rest is context under DoF). Precise masks impossible without clean frames of
  known camera; recorded as observed-strong, unquantified.
- Genesis targets: playfield dominates (~70–85% visual est), thin context apron, backdrop
  plate; the ruled four-band context contract is exactly the TS direction, unbuilt.

## 1.4 Deployment → first consequential choice (§5.1 Q4)

- FFT (cohort views + documented starts): party spawns at a board edge; enemies visible
  immediately; first branch (route/height choice) within **2–4 cells**.
- TS (Wolffort deploy render): deploy tiles abut the contested street; first choice
  (street vs stair-to-roofs) is **1–3 cells** out. Pre-battle exploration phase moves some
  decisions *before* deployment entirely (documented).
- Genesis: the active-window contract requires arrival "at or very near the first
  decision" (1–3 cells, documented in PROMPT-SET). **Aligned with the corpus — and the
  corpus never wastes approach acreage.** (§5.1 Q5: FFT longest mandatory approaches on
  cohort maps: 8–20 cells; nothing like overview-board walking exists.)

## 1.5 Backtracking (§5.1 Q5)

FFT objectives are kill-all/protect on ≤225-cell boards: backtrack ≈ 0–5 cells (chasing a
runner). TS adds reinforcement waves that *re-use* already-crossed ground (three waves at
Wolffort, documented) — the board refills instead of the player re-walking. Genesis's
movement doctrine (zero walking-to-operate) is not contradicted anywhere in the corpus:
**neither reference game ever makes the player traverse solved, empty space.** The
corpus's answer to "more content" is stacking events on the same compact floor, not
extending the floor.

## 1.6 Empty-but-useful cells (§5.1 Q6)

Quiet-ground share on cohort maps (visual, from plates): Mandalia ~50%, Igros forecourt
~35%, Zeakden snowfield ~40%, Dorter plaza ~25%, interiors ~20–30%. This is composition,
not waste: silhouette framing, deployment room, kite space. TS keeps the same discipline
(Wolffort's plaza ground between stall rows). Genesis's quiet-ground reservation rule
(grammar study) matches; the compiler must protect it from dressing.

## 1.7 Elevation bands: consequential vs decorative (§5.1 Q7, §5.2 Q2)

- FFT cohort: 2–5 bands; every reachable band is contestable (height = attack/defense +
  range mechanics per the Aerostar BMG, 783K-char local copy); scenery-only verticals are
  clearly nonwalkable (spires, church towers, tree crowns).
- TS: Wolffort's four bands (street/mid/roof/wall) are the fight (guides: control roofs,
  hold totem chokes); flier-only perches add a fifth non-walker band.
- Genesis: targets state 2–4 stacked bands; fixtures prove 2–3; movement/dash query live.
- **H4 evidence:** Zirekile (110 cells, 3 bands + a drop) out-reads Mandalia (156 cells,
  2 bands) for perceived depth in every view — height and void beat area. Same in
  Genesis's own corpus: the fortress vignette target reads deeper than the flat camp
  target at similar footprint.

## 1.8 Topology counts (§5.2 Q1)

Cohort medians (per-map values in CSV): primary routes 1 (Mandalia's open field = 2–3
broad approaches); alternates 0–2; short loops 0–1; chokepoints 0–2 (gates/bridges);
reachable high grounds 1–6; scenery masses 1–8. **The shape is: one spine, one licensed
alternate, one constraint** — exactly the site-grammar shape Genesis already ruled
(hard/arrangeable obligations). TS raises route counts modestly (street grids), never to
maze density.

## 1.9 Focal-object placement (§5.2 Q4)

Cohort: gates sit ACROSS the spine (Igros, Zeakden); centerpieces sit at the head of the
space (Orbonne church, Windmill machine) or astride the crossing (Zirekile bridge); Dorter/
Bervenia put the tallest mass off-center on a terrace. Nothing meaningful sits in the
geometric center of an open floor. Matches the grammar study's transition rule; Genesis's
scale-pass targets already obey (weighbridge at the threshold, hall at the head).

## 1.10 The Genesis size question (§5.1 Q10) — comparison, not a ruling

| band | cells | vs FFT (median 120 / max 225) | read |
|---|---|---|---|
| tightened refinement 10×14 | 140 | ≈ FFT median | battle-native |
| active-window center 12×16 | 192 | ~80th percentile FFT | comfortable vignette |
| prompt ceiling 16×18 | 288 | **larger than every shipped FFT map** | at the corpus's outer edge |
| scale-pass "small" intents 13×15–18×22 | 195–396 | FFT-max to 1.8× FFT-max | already TS-scale |
| scale-pass "medium" intents 22×24–26×32 | 528–832 | **2.3–3.7× FFT max; > TS estimates** | beyond both reference games |
| archived extra-large 32×36–40×46 | 1152–1840 | 5–8× FFT max | correctly ruled NOT A GOAL |

**The honest tension this lane must surface (not silently resolve):** the *vignette* band
(10×14–16×18) sits exactly where the corpus lives. The *medium site* documented intents
(22×24–26×32) exceed not only FFT but the TS estimates — they are walk-scale windows, and
the movement doctrine will be carried entirely by how little of that floor is mandatory
traversal. This is a live design fact, not an error; it goes to the founder packet as
question F-1 rather than a recommendation smuggled into prose.

### Three size-policy options (the brief allows at most three; none is ruled here)

- **Option A — battle-median band.** Battle windows target 10×14 center, 12×16 max
  (FFT median→80th percentile). Tightest pacing, cheapest composition, easiest beauty per
  frame; site programs above that size must always link windows. Risk: site presence and
  service programs (camp/market rows) get cramped; more window transitions to author.
- **Option B — status quo.** Keep 12×16 center / 16×18 ceiling for battle+site windows;
  keep medium intents (22×24+) as *site* windows where battle is one region of the floor.
  Matches everything already rendered; risk: medium windows quietly become the walking
  boards the doctrine bans — mitigable only if arrival/decision density is enforced by the
  compiler (first decision ≤3 cells, no mandatory dead traversal >6 cells).
- **Option C — two-band law + linked windows.** Battle band = A; site band capped at
  ~18×22 (the largest small intent), and every documented medium/large program is realized
  as 2–3 linked compact windows with precommitted frontiers (recipe R6). Costs: window
  transition polish becomes mandatory infrastructure earlier. Buys: the doctrine is
  structurally unbreakable and every window stays inside proven-beautiful scale.

Tradeoffs stated; the sample is not converted into a cap (§2 boundary honored).

## 1.11 Findings

```text
FINDING L1-1
Claim: FFT's entire shipped battle corpus fits at or under 225 cells (median 120), and the
       reason is documented (60fps cursor UI), then kept as diorama aesthetics.
Evidence: 117 measured maps; Matsuno/Sakaguchi/Ito 1997 (local copy); FFHacktics grids.
Evidence class: direct frame (measured) + developer statement
Confidence: high
Genesis translation: the vignette band is corpus-native; the 16×18 ceiling already grants
       more area than any map FFT shipped. Nothing about beauty requires going larger.
Solo-cost class: n/a (evidence)
Decision status: research finding only
```

```text
FINDING L1-2
Claim: Neither reference game ever makes the player traverse solved empty space; density
       comes from stacked bands and refilling events, not floor area.
Evidence: objective structures + reinforcement waves (documented); cohort approach
          measurements; TS deploy adjacency (frames).
Evidence class: documented gameplay + direct frame
Confidence: high
Genesis translation: the movement doctrine is the corpus norm, not a constraint to defend;
       enforce it as compiler checks (first-decision distance, mandatory-traversal ceiling)
       rather than by shrinking site ambitions.
Solo-cost class: renderer multiplier (compiler rule)
Decision status: research finding only
```
