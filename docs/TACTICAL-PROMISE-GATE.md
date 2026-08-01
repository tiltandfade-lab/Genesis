---
type: system-spec
project: Genesis
status: SPECCED 2026-07-31 (founder-authorized, ruling 4 of the 07-31 set) — T1/T2 buildable now
created: 2026-07-31
owner: spatial compiler program
serves:
  - GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md (+ its 2026-07-31 founder rulings)
  - docs/research/SPATIAL-COMPILER-DIVERSITY-MATH.md (the dealing-memory receipt)
  - Reference/FFT-Triangle-Strategy-World-Study/ (the evidence corpus)
---

# TACTICAL PROMISE GATE

## 0. What this is and the ruling behind it

Adam's 2026-07-31 ruling, in his words: the engine's job is not replicating a Roman guard
post accurately — it is replicating "the fun and challenging battles of the best of the
best tactics games." This spec converts that from an adjective into a gate: **a battle
plan (tactical skeleton) must land inside measured FFT-corpus bands on the tactical
metrics that make those maps good, before any architecture, material, or render spend.**

The diversity gate (plan §7.2) keeps sites from repeating. THIS gate keeps each one worth
fighting on. They are different teeth and neither substitutes for the other.

Compiler-order context (ruled the same session): the tactical skeleton is the SPINE —
rolled from the walk digest before plots/assembly; earthworks and architecture are the
justification pass that realizes it without breaking it.

## 1. The evidence base (already in the repo)

`Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv` — 45 measured maps,
37 columns, per-map sources and confidence tags. The tactical columns this gate consumes:

| CSV column | what it measures |
|---|---|
| `traversableCellEstimate` | playable cell count (the size class driver) |
| `elevationBandCount` | distinct consequential height tiers |
| `maxConsequentialElevationDelta` | tallest height difference that matters in play |
| `majorRouteCount` + `alternateRouteCount` | genuinely different approaches |
| `shortLoopCount` | cycles enabling flank/re-position play |
| `chokepointCount` | holdable narrows |
| `reachableHighGroundCount` | climbable overlooks (vs `sceneryOnlyHighMassCount`) |
| `spawnToFirstDecisionCells` | dead marching before the first real choice |

`lane-1-footprint-topology-pacing.md` records HOW the study counted each — its counting
rules are the authority the harness must match (see G3).

## 2. Deliverables

### T1 — band extraction (buildable now)

`dev/research/extract-tactical-bands.mjs` — parses MEASUREMENTS.csv (handle quoted
commas, range values like "3-4" → midpoint, and confidence tags), groups maps into three
size classes by `traversableCellEstimate` terciles, and emits per-class, per-metric
distributions: min / p10 / median / p90 / max, n, and the source rows. Ranges tagged
MEASURED; any interpretation (midpointing, tercile edges) tagged DERIVED with the rule.

Output: `docs/intel/tactical-promise-bands.json` (committed truth) +
`docs/intel/tactical-promise-bands.md` (readable table). Deterministic: two runs
byte-identical (no timestamps).

### T2 — the gate harness (buildable once T1's bands land)

`dev/verify-tactical-promise.mjs` — input: a `TacticalSkeletonV1` object (below), NOT a
render. Computes the eight metrics FROM THE PLAN and asserts each against its size-class
band: outside p10–p90 = WARN, outside min–max = BLOCK, with named per-metric verdicts in
the output. No aggregate "fun score" — an average must never hide a flat metric.

`TacticalSkeletonV1` (minimum contract; the compiler waves may extend, never shrink):

```text
TacticalSkeletonV1
  id / seedRef / sizeClass
  cells[] { x, y, h, walkable }
  routes[] { id, kind: major|alternate, cells[], exposure }
  loops[] { id, cells[] }
  chokepoints[] { id, cells[], widthCells }
  highGround[] { id, cells[], reachableBy[] }
  deployments[] / objectives[] / retreats[]
  interactives[] { id, noun, verbs[], cells[] }   // noun-centric per Adam 2026-07-31:
                                                  // one gate (noun) affords open/close/
                                                  // bar/break (many verbs)
```

Metric derivations (each must quote lane-1's counting rule beside its implementation):
- routes: distinct = ≤30% shared cells between any two counted routes (DERIVED — flag if
  lane-1 states a different rule; lane-1 wins).
- chokepoint: a route-crossing narrows of width ≤2 cells.
- elevation band: a tier holding ≥5% of traversable cells OR touching a route/objective.
- reachable high ground: tier ≥2h above an adjacent route, with a walk/climb path.
- spawnToFirstDecision: cells from deployment centroid to the first cell where ≥2
  counted routes diverge.

### T3 — receipt tie-in (spec only; rides with the compiler waves)

The gate's per-metric verdicts and the §7.2 categorical signature are emitted into the
SAME candidate receipt, so the campaign dealing memory (07-31 ruling 2) consumes one
record: what was dealt (signature) and why it was worth fighting on (metrics). No
implementation in this lane — field shape only, so the compiler waves inherit a stable
name: `receipt.tacticalPromise = { sizeClass, metrics{...}, verdicts{...} }`.

## 3. Gates (red-first, all runnable in this lane)

- **G1 (T1):** parses all 45 data rows, zero NaNs in emitted bands, byte-identical on
  rerun; the .md table row-counts match the CSV.
- **G2 (T2):** red-first BOTH directions —
  (a) RED: a hand-built `LEGACY_GP` fixture translating the current `gvsGuardCandidate`
  template (one major route + flank, no loop) must FAIL at least two named metrics
  (expected: shortLoopCount, alternateRouteCount or spawnToFirstDecision) — this is the
  honest red proving the gate would have caught the wave-2 flatness;
  (b) GREEN: a fixture hand-translated from one real CSV row (Grog Hill MAP081 — the
  CSV row is the authority: 4 bands, 5-6h delta, 1 major + 1 alternate route, 1 loop,
  2 chokepoints, 4 reachable high grounds, spawn-to-decision 2-3) must PASS its class.
  (2026-07-31 correction: this spec's first draft column-shifted these numbers; caught
  by the T1 executor against the CSV. The CSV row wins over any restatement here.)
  Both fixtures live in `dev/research/fixtures/` with their derivations commented.
- **G3 (parity):** every metric implementation carries a quoted counting rule from
  lane-1; each divergence is listed in the harness header as DERIVED with a one-line
  reason. An unquoted metric is a failing review, even if its numbers look right.
- **G4:** no src/ or manifest edits in this lane (dev/ + docs/ only) — check-manifest
  untouched; if a later wave moves the harness into CI, that wave owns registration.

## 4. Non-goals

- No compiler implementation, no renders, no camera/material/beauty claims.
- No aggregate scoring, ranking, or ML fitness — bands, verdicts, receipts only.
- No new corpus acquisition: 45 maps is the base; widening the corpus (more TS rows,
  Tactics Ogre) is a separate founder-priced lane.
- The gate never edits a skeleton to pass (validators preserve the thing's job).

## 5. Open founder questions (none block T1/T2)

1. ~~Band blend~~ **RULED (Adam, 2026-07-31, on visible numbers): pool everything —
   FFT+TS pooled bands for all eight metrics.** (Claude's pool-except-height-delta
   recommendation was considered and overruled; the Telliore unit-incomparability
   caveat stays flagged in the bands data, and the pooled delta max of 32 stands as
   the BLOCK ceiling.)
2. ~~WARN policy~~ **RULED (Adam, 2026-07-31): B now, A ideally.** WARN-carrying
   candidates are a fallback tier — selected only when the bounded candidate set holds
   no all-green member (B). The aspirational end-state, revisited once real candidates
   exist, is A: warned candidates compete with a penalty, so an outlier-but-brilliant
   composition can occasionally beat a boring all-green one. Any move from B to A is
   its own founder ruling with visible candidate evidence.
3. ~~Interactives~~ **RULED (Adam, 2026-07-31):** floor accepted for now, reframed
   noun-centric — **≥1 interactive NOUN per skeleton** (a gate, a windlass, a brazier:
   one doer affording many verbs), ASSUMED band until a dedicated interactives study
   prices a real one. The skeleton contract's `interactives[]` is noun-keyed accordingly.
