# Spatial compiler diversity math — how many distinct compositions does a campaign actually need?

```
type: research-note
status: measured analysis for the spatial compiler decision — not canon, not a spec
branch: docs/spatial-compiler-research
date: 2026-07-31
scripts: dev/research/measure-site-demand.mjs · dev/research/axis-space-monte-carlo.mjs
inputs: GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md §2/§5/§7.2 · GOLDEN-SITES-CATALOG.md ·
        production rollers (walk.js, dungeon-walk.js, wild-walk.js) + vignette-observatory/1
```

Every number below is tagged **MEASURED** (script output, reproduce command given),
**DERIVED** (exact formula applied to measured inputs — checkable by hand), or
**ASSUMED** (a modeling choice, stated).

---

## 1. The question

"Infinite replayability" is not a number. The buildable question is: **over a long campaign,
how many perceived-distinct compositions per site family keep the odds of a player seeing
the same categorical composition twice acceptably low — and does the plan's design
(macro skeleton/parcel/earthwork axes + a small chassis library + a WFC piece layer)
yield that many?** "Perceived-distinct" is operationalized as the plan's own §7.2 diversity
gate: two compositions read as different only when at least four of the eight categorical
axes differ (footprint dimensions, roof pitch, props, culture, condition, and palette
explicitly do not count).

## 2. Measured site-demand rates

**Method (MEASURED).** `dev/research/measure-site-demand.mjs` loads `tables.js` plus the
three production walk rollers and the vignette observatory into one classic-script scope
(the exact loading pattern of `dev/verify-vignette-observatory.mjs`; no jsdom), rolls
2,000 walks per environment (6,000 total) under isolated named-seed audit RNG, feeds each
walk through `vignetteRequestFromWalk`, and counts `materializationIntent.disposition`,
bucketing `MATERIALIZE_NEW` by `hostProgram.owner`.

Reproduce (deterministic — two runs diff clean, verified):

```
node dev/research/measure-site-demand.mjs 2000
```

**Per-environment dispositions (MEASURED, n=2,000 each):**

| environment | MATERIALIZE_NEW | DECORATE_LOCAL | UNRESOLVED |
|---|---|---|---|
| urban | **90.20%** | — | 9.80% (all AMBIGUOUS_DISPOSITION) |
| dungeon | **92.50%** | — | 7.50% (all AMBIGUOUS_DISPOSITION) |
| wilderness | **7.70%** | 92.30% (LocalFeature 75.75%, HeroFeature 16.55%) | — |

Urban and dungeon walks almost always demand a materialized host (the walk's primary type
maps to an owner). Wilderness is decoration-dominated: only one walk in thirteen demands a
true site; the rest want a local or hero feature, not a program.

**Per-walk MATERIALIZE_NEW rate by host family (MEASURED), blended across an ASSUMED
uniform environment mix (1/3 urban, 1/3 dungeon, 1/3 wilderness; tiers 1/2 alternating):**

| host family (golden-site kinship) | urban | dungeon | wilderness | blended /walk |
|---|---|---|---|---|
| UrbanInstitutionHost (Site 10) | 27.05% | — | — | **9.02%** |
| InfrastructureWorksHost | 8.85% | 13.95% | — | **7.60%** |
| FuneraryMortuaryHost (Site 3 kin) | — | 18.65% | — | **6.22%** |
| NaturalCavernHost (Site 7) | — | 18.30% | — | **6.10%** |
| UrbanFabric | 17.65% | — | — | **5.88%** |
| DefenseFortificationHost (Site 9 interior) | — | 16.70% | 0.35% | **5.68%** |
| ServiceInfrastructureHost | 9.85% | — | 2.05% | **3.97%** |
| WorkshopProductionHost (Site 5 kin) | 8.50% | 2.90% | — | **3.80%** |
| HospitalityEntertainmentVenue | 9.30% | — | — | **3.10%** |
| MarketExchangeHost (Site 10 kin) | 9.00% | — | — | **3.00%** |
| ResidentialEstateHost | — | 8.85% | — | **2.95%** |
| ReligiousSanctuaryHost (Site 4 kin) | — | 7.30% | — | **2.43%** |
| ExtractionWorkHost (Site 5) | — | 3.45% | 0.65% | **1.37%** |
| MegastructureHost | — | 1.80% | — | **0.60%** |
| EcologyClaimHost (Site 7 lair) | — | — | 1.60% | **0.53%** |
| DefenseRouteControlHost (**Site 1 Guard Post**) | — | — | 1.25% | **0.42%** |
| CommunalInstitutionHost (Site 4) | — | — | 1.20% | **0.40%** |
| LivingSubstrateHost (Site 12 kin) | — | 0.60% | — | **0.20%** |
| TransientServiceHost (Site 2 Camp) | — | — | 0.60% | **0.20%** |
| **ANY site family** | 90.20% | 92.50% | 7.70% | **63.47%** |

Stability check (MEASURED): a 4,000-per-environment run moves the pooled rate from 63.47%
to 63.49% and no family by more than ±0.4 points — the 2,000-walk rates are converged.
The dungeon DefenseFortificationHost rate (16.70%) independently reproduces the catalog's
previously banked 14.62% fortification-interior figure to within sampling noise.

**Caveats on the rates:**

- **Upper bound vs returns (ASSUMED fresh walks).** The harness has no persistence layer,
  so every demand is a first-visit `MATERIALIZE_NEW`. Real campaigns revisit sites
  (`CONTINUE_EXISTING`), which lowers new-site demand. Treat rates as ceilings.
- **Floor vs vocabulary gaps (MEASURED).** 9.8% of urban and 7.5% of dungeon walks land
  UNRESOLVED because the walk type maps to no owner. Notably the dungeon table row
  "Prison / Asylum" is deliberately unmapped in `vgoDungeonOwners`, so **Site 6 custody
  demand from walks is real but currently invisible** (it fires only through capture
  flows). Mapping those rows would raise, not lower, the family rates.
- One walk yields at most one primary site demand in this adapter; secondary in-walk
  structures are not counted. Another reason the per-family numbers are conservative.

## 3. How many distinct compositions does a campaign need?

**The math, plainly.** Suppose a family is encountered `M` times in a campaign of `L`
walks (M is binomial: each walk demands this family with the measured probability `r`),
and each encounter shows one of `D` perceived-distinct compositions chosen uniformly and
independently (a **memoryless** generator). The chance at least two encounters show the
same composition is the birthday problem, averaged over the campaign's actual encounter
count:

```
P(repeat) = 1 − Σ_m Bin(L,r)(m) · Π_{i=1}^{m−1} (1 − i/D)
```

The script inverts this exactly (binary search on D). A hand-checkable closed form is
`D ≈ m(m−1) / (2·ln(1/(1−p)))` at `m = L·r`, i.e. **needed D grows with the square of
encounters** for a memoryless generator: `D ≈ 1.74·m(m−1)` for a 25% repeat budget and
`D ≈ 0.72·m(m−1)` for 50%.

**Needed distinct compositions per family (DERIVED from measured rates; exact formula
above), for campaigns of 50 / 200 / 500 walks:**

| family | rate/walk | L=50: m → D@25% / D@50% | L=200: m → D@25% / D@50% | L=500: m → D@25% / D@50% |
|---|---|---|---|---|
| UrbanInstitutionHost | 9.02% | 4.5 → **33 / 12** | 18.0 → **553 / 224** | 45.1 → **3,500 / 1,438** |
| InfrastructureWorksHost | 7.60% | 3.8 → 23 / 9 | 15.2 → 391 / 157 | 38.0 → 2,483 / 1,018 |
| FuneraryMortuaryHost | 6.22% | 3.1 → 15 / 6 | 12.4 → 260 / 104 | 31.1 → 1,658 / 677 |
| NaturalCavernHost | 6.10% | 3.0 → 15 / 5 | 12.2 → 251 / 100 | 30.5 → 1,596 / 652 |
| UrbanFabric | 5.88% | 2.9 → 14 / 5 | 11.8 → 233 / 93 | 29.4 → 1,484 / 606 |
| DefenseFortificationHost | 5.68% | 2.8 → 13 / 5 | 11.4 → 217 / 86 | 28.4 → 1,384 / 565 |
| ServiceInfrastructureHost | 3.97% | 2.0 → 6 / 2 | 7.9 → 104 / 41 | 19.8 → 670 / 271 |
| WorkshopProductionHost | 3.80% | 1.9 → 6 / 2 | 7.6 → 96 / 37 | 19.0 → 615 / 249 |
| HospitalityEntertainmentVenue | 3.10% | 1.6 → 4 / 1 | 6.2 → 63 / 24 | 15.5 → 407 / 164 |
| MarketExchangeHost | 3.00% | 1.5 → 3 / 1 | 6.0 → 59 / 23 | 15.0 → 381 / 153 |
| ResidentialEstateHost | 2.95% | 1.5 → 3 / 1 | 5.9 → 57 / 22 | 14.8 → 369 / 148 |
| ReligiousSanctuaryHost | 2.43% | 1.2 → 2 / 1 | 4.9 → 38 / 14 | 12.2 → 250 / 99 |
| ExtractionWorkHost | 1.37% | 0.7 → 1 / 1 | 2.7 → 12 / 4 | 6.8 → 77 / 30 |
| MegastructureHost | 0.60% | 0.3 → 1 / 1 | 1.2 → 2 / 1 | 3.0 → 14 / 5 |
| EcologyClaimHost | 0.53% | 0.3 → 1 / 1 | 1.1 → 2 / 1 | 2.7 → 11 / 4 |
| **DefenseRouteControlHost (Guard Post)** | 0.42% | 0.2 → **1 / 1** | 0.8 → **1 / 1** | 2.1 → **7 / 2** |
| CommunalInstitutionHost | 0.40% | 0.2 → 1 / 1 | 0.8 → 1 / 1 | 2.0 → 6 / 2 |
| LivingSubstrateHost | 0.20% | 0.1 → 1 / 1 | 0.4 → 1 / 1 | 1.0 → 2 / 1 |
| TransientServiceHost (Camp) | 0.20% | 0.1 → 1 / 1 | 0.4 → 1 / 1 | 1.0 → 2 / 1 |

(The pooled ANY-family row — 31.7/126.9/317.3 expected sites — is deliberately excluded as
a requirement: a mine repeating a crypt's composition is not a perceivable repeat. The
per-family rows are the binding ones.)

**The linear alternative.** A generator **with anti-repeat memory** — one that records each
family's dealt categorical signature (which §7.2 already requires in every receipt) and
rejects a candidate that fails the gate against that family's history — never shows a
perceived repeat until its library is exhausted. Its requirement is **D ≥ M**, linear:
the 97.5th-percentile encounter counts at L=500 are **58** for UrbanInstitutionHost and
**50** for InfrastructureWorksHost (DERIVED, exact binomial). Quadratic-vs-linear is the
entire decision: memoryless dealing needs thousands; dealt-without-repeat needs about sixty.

## 4. How many distinct compositions does the eight-axis gate yield?

**Method (MEASURED).** `dev/research/axis-space-monte-carlo.mjs` models the §7.2 axes with
ASSUMED value counts — route topology 5, handedness 2, post-to-route relation 4, chassis
family K (swept 3/6/10), earthwork signature 4, lookout position 3, retaining/yard 3,
deployment geometry 3 — and computes, per K: (a) the exact distribution of differing axes
between two independent uniform tuples (DP convolution), verified by 1,000,000 seeded
Monte-Carlo pairs; (b) the greedy maximum library over the shuffled full enumeration —
the largest set found in which **every pair** passes the ≥4-axis gate — with the
mixed-alphabet Singleton bound as the ceiling.

Reproduce (deterministic):

```
node dev/research/axis-space-monte-carlo.mjs
```

| K (chassis) | raw tuples | P(pair passes gate) q | mean axes differing | memoryless pool D_eff = 1/(1−q) | greedy max library (3 shuffles) | Singleton upper bound |
|---|---|---|---|---|---|---|
| 3 | 12,960 | 0.9318 (MC 0.9317) | 5.47 | **14.7** | **62–64** | 162 |
| 6 | 25,920 | 0.9498 (MC 0.9494) | 5.63 | **19.9** | **89–91** | 216 |
| 10 | 43,200 | 0.9570 (MC 0.9574) | 5.70 | **23.3** | **105–106** | 216 |

Two readings of the same space:

- **Rolled memoryless**, the machine behaves like a uniform pool of only **15–23**
  compositions: although 93–96% of random pairs pass the gate, the 4–7% that fail is what
  the birthday problem feeds on. Raw tuple counts (12,960–43,200) are a mirage — the
  ≥4-axis rule collapses each tuple's Hamming neighborhood into "reads the same."
- **Dealt with memory**, the same axes support a library of **~63 (K=3), ~90 (K=6),
  ~105 (K=10)** compositions that are *pairwise* categorically distinct — measured lower
  bounds, with a hard ceiling of 162–216 no matter how many chassis are added (the
  Singleton bound deletes the three richest axes, so chassis richness beyond ~6 stops
  buying distinctness: K=10 adds only ~15 library slots over K=6).

## 5. Needed versus yielded

Repeat probabilities below are DERIVED by the section-3 formula from measured rates and
measured pool sizes.

**Memoryless rolling (pool = D_eff):** fails everything but short campaigns and rare
families. Busiest family (UrbanInstitutionHost), 25% budget:

| campaign | needed D | yielded D_eff (K=3/6/10) | P(repeat) at K=6 |
|---|---|---|---|
| L=50 | 33 | 14.7 / 19.9 / 23.3 | **35.8%** |
| L=200 | 553 | 14.7 / 19.9 / 23.3 | **99.5%** |
| L=500 | 3,500 | 14.7 / 19.9 / 23.3 | **~100%** |

Even uniform dealing from a *curated* max library, memorylessly, still repeats: with the
K=6 library of 90, the busiest family hits 80.1% repeat odds by L=200. No feasible K
rescues memoryless dealing — needed D grows quadratically while the axis space is capped
at 216.

**Dealing with anti-repeat memory (requirement = library ≥ campaign encounters):** passes.

| family (worst cases) | encounters at L=500 (mean / 97.5th pct) | K=3 library 63 | K=6 library 90 |
|---|---|---|---|
| UrbanInstitutionHost | 45.1 / 58 | P(exhaust) = **0.31%** | **~0.00%** |
| InfrastructureWorksHost | 38.0 / 50 | 0.00% | 0.00% |
| DefenseRouteControlHost (Guard Post) | 2.1 / 5 | 0.00% | 0.00% |

At 200 walks every family is covered by K=3 with an order of magnitude of headroom. At
500 walks K=3 still technically holds for the busiest family (0.31% exhaustion odds) but
with almost no margin above the 97.5th-percentile demand of 58; **K≈6 covers a 500-walk
campaign for every family with roughly 1.5–2× headroom**, and K=10 buys little more.

**Guard Post irony (MEASURED):** Site 1, the diversity gate's proof family, is the
*second-rarest* family in the game — 0.42% per walk, about two new guard posts per
500-walk campaign. Its §7.1 three first compositions almost satisfy its own 500-walk
25%-budget need of 7. The diversity machinery earns its keep on the families nobody
designed it for: urban institutions, infrastructure, crypts, caverns, and fortification
interiors, each needing its own equivalent of the eight axes and a handful of chassis.

## 6. Conclusion in plain English

**Macro-layer variation plus a small chassis library meets the need — but only if the
compiler deals compositions against a memory, not rolls them independently.** The measured
demand is roughly one new site every 1.6 walks, spread across ~19 families with the
busiest at one site per 11 walks. For that busiest family a 500-walk campaign would need
about 3,500 distinct compositions under memoryless rolling — unreachable, since the
eight-axis space behaves like a pool of only ~15–23 and is hard-capped at 216 pairwise-
distinct compositions. The same axes, dealt with the gate enforced against each family's
already-materialized signatures, need only to out-run ~58 encounters, and measurably do:
~63 pairwise-distinct compositions at three chassis, ~90 at six. So the recommendation the
math supports: **per-family categorical-signature memory in the campaign state (the §7.2
receipt, promoted from a census check to a dealing constraint), roughly six chassis
families per high-frequency host, and the skeleton/parcel/earthwork axes carrying most of
the distinctness** — route topology, post-to-route relation, and earthwork signature are
worth 5×4×4 of the space on their own, which is exactly the plan's macro-first bet.

**What the WFC piece layer adds and does not add.** By the gate's own definition the piece
layer adds **zero categorical distinctness** — walls, corners, roof edges, openings, and
trim live in the surface vocabulary the gate refuses to count, and §5.1 already forbids
fine modules rescuing a failed chassis collapse. Its diversity value is real but different:
it keeps the sub-gate pairs honest (two sites sharing 5+ axes still shouldn't be
plank-for-plank identical), it lets one chassis express many cultures/conditions without
spending categorical budget, and it preserves return recognition (a revisited site must
read as *the same place*, which deterministic piece collapse gives for free). Buy chassis
and macro axes for "have I been here before?"; buy the piece layer for "this place is
specific." The two spends are not interchangeable, and the numbers above size the first
one: **about six chassis per busy family, ~60–90 dealt compositions of library depth, and
a campaign-level anti-repeat memory — that is what "infinite replayability" costs when it
is converted into a number.**

**Assumption ledger (what could move these numbers):** uniform environment mix (a town-
heavy campaign pushes the urban families higher); fresh-walk ceiling vs return traffic
(lowers demand); unmapped walk types incl. Prison/Asylum (raises demand when mapped); axis
value counts and axis independence (terrain correlation between route, relation, and
earthwork shrinks both D_eff and the library — the measured library sizes are optimistic
by some factor; a conditioned re-run once real chassis lists exist is the follow-up); and
the gate itself as the definition of "perceived distinct" (if players perceive repeats the
gate calls distinct, the per-axis salience needs retuning, not this math).
