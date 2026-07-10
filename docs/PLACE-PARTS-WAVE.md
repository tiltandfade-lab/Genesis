---
type: build-spec
project: Genesis
status: "BUILT 2026-07-10 (overnight) — all 19 units authored, wired, and gated on branch
  claude/overnight-parts-modeling-d0131e (3 commits: spec 4b42039 · Wave A 0713973 · Waves B+C
  5519965). Models PROVISIONAL pending Adam's morning sheet review (sheets:
  dev/model-qa/sheets/place-parts-wave-{a,b,c}.png). Morning pick-list flags: C3 careening frame
  IMPROVED_WITH_DOUBT (hull-rib curvature weak) · B4 mill wheel wet-quarter tell subtle · A7
  doorframe hinge detail small at grade. Master merge awaits Adam's confirm."
created: 2026-07-09
related:
  - "[[PLACE-ASSET-QUEUE]]"   # the grounded sweep this executes — briefs live there
  - "[[MODEL-FOUNDRY]]"       # the locked per-model process + laws (re-scoped to props/architecture)
  - "[[PLACE-GEN]]"           # the system these parts dress
  - "[[TABLETOP-VISION]]"     # rim-and-doorway ruling (§2) — why the shell pieces exist
---

# PLACE-PARTS-WAVE — overnight build: the Part-1 place parts (19 units, 3 waves)

**What this is.** The overnight modeling run over `PLACE-ASSET-QUEUE.md` Part 1 (3D models lane):
anchor furniture + architecture shell + the one big-fixture gap. 20 queue rows − 1 already-done
(the Shrine altar wiring fix landed in unit 8 — `build/gen-place-skins.py` row 6 already points at
"Blood-Slick Altar"; verified 2026-07-09) = **19 build units**, chained P1-first so partial
completion is still landable (budget pre-flight law).

## Scope

- **IN:** the 19 Part-1 rows below — builder modules under `dev/model-qa/creatures/prop-*.js`,
  plus the orchestrator-owned wiring per wave (§Wiring).
- **OUT (do not touch):** Part 2 sprites (Adam's ImageGen lane) · the 31 pre-scoped `net-new:`
  fixtures in `dev/model-qa/realm-props.json` (owned by their realm waves) · backfill-realm skin
  files · any engine behavior beyond the wiring surfaces named in §Wiring · `WHOLE_OBJECT_REGISTRY`
  / `ps1-sheet.html` SETS / `gen-place-skins.py` (orchestrator-only, per MODEL-FOUNDRY dispatch law).

## Decisions (recorded; executors never re-litigate)

1. **Author-only config** (Adam's 2026-07-09 batch ruling): LOW-effort Sonnet authors + mandatory
   hostile self-review in-prompt; no separate critic pass. Orchestrator gates mechanically + eyes-on.
2. **Foundry laws apply, prop-recast:** silhouette-first, value contrast (≥1 high-value zone,
   ≥0.04u feature floor), tris only for countable features (band 1,000–2,000 is a ceiling envelope —
   a fully-read prop at 400 tris passes; most props should land well under band). Law 5 (pose)
   recast for objects: **the prop is built mid-use** — the stall has goods on the counter lip, the
   gate has its arm half-down, the forge glows. A bare geometric primitive with no use-tell fails.
3. **Cross-realm parts build neutral** (weathered wood/stone/steel palette per `prop-altar.js`'s
   VS-desaturated convention); realm identity enters via the realm-props entries + tint at wiring,
   not per-realm module forks. Realm-specific units (standpipe, chain-link, turnstile) build in
   their realm's register directly.
4. **Extensions live in the donor file** — a new exported build fn beside the existing one, never a
   new module (dedupe-hard law). Each donor file is touched by exactly one unit (no collisions).
5. **Landing:** per-wave commits on `claude/overnight-parts-modeling-d0131e`; master merge at the
   morning close (after Adam's sheet eyes-on) via `/genesis-clean-close`. `data/place-skins.js`
   regenerates from `gen-place-skins.py` at wiring — never hand-edited.

## The units

Output path `dev/model-qa/creatures/<file>`. Grammar: one exported build fn, probe-lib primitives
(`import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js'`), whole-object
(no anchors), ground clearance y≈0.055 (floor gate [-0.01, 0.08]). Scale: a figure is ~1.5u tall
(≈6 ft) → waist ≈0.5u, door clear height ≈1.7–1.9u, one 5-ft cell ≈1.25u. Gold exemplar:
`dev/model-qa/creatures/prop-altar.js` (read it first — header format, box helper, palette).

### Wave A — P1 (8 units)

| # | Unit | File / fn | Prop key | Footprint | Realm | Brief (full text in PLACE-ASSET-QUEUE) |
|---|---|---|---|---|---|---|
| A1 | Long counter / bar-run | extend `prop-table.js` → `buildCounterRun` | `prop:counter-run` | 2×1 | all | 10-ft waist-high scarred plank run, straight with an L-corner return; bottle/mug clutter on top (the use-tell). |
| A2 | Judge's bench / dais | new `prop-judge-bench.js` → `buildPropJudgeBench` | `prop:judge-bench` | 2×1 | all | Raised plank/stone platform (~1 cell high) behind a rail/desk-run; authority reads from elevation + silhouette, not ornament. |
| A3 | Cell bars / holding-frame | extend `prop-hangingcage.js` → `buildBarRun` | `prop:cell-bars` | 1×1 | all | Floor-standing vertical iron-bar frame, floor to near-ceiling, one cell-wide tiling module; bar spacing wide enough to read at 1/3-res (≥0.04u bars). |
| A4 | Market stall frame | new `prop-stall-frame.js` → `buildPropStallFrame` | `prop:stall-frame` | 1×1 | all | A-frame/lean-to stall skeleton, cloth canopy, narrow counter lip with goods; tiles in rows. |
| A5 | Standpipe / waterworks tank | new `prop-standpipe.js` → `buildPropStandpipe` | `prop:standpipe` | 2×2 | Gloom | Squat riveted-steel water tower on 4 stub legs, door painted shut — the named-ADD-place anchor. |
| A6 | Shop counter + till-nook | new `prop-shop-counter.js` → `buildPropShopCounter` | `prop:shop-counter` | 1×1 | all | L-shaped waist-high counter + small back-shelf nook — transactional read, distinct from A1's social bar-run. |
| A7 | Doorway frame (typed) | extend `prop-arch.js` → `buildDoorframe` | `prop:doorframe` | 1×1 | all | Human-scale jamb+lintel (non-monumental, vs the existing archway); param-typed leaf: plank / steel-slot / stone / screen. |
| A8 | Gate (checkpoint) | new `prop-gate-checkpoint.js` → `buildPropGateCheckpoint` | `prop:gate-checkpoint` | 2×1 | all | Barrier arm or barred double-gate in a rim gap, guard-stand beside it — must read "controlled crossing," not scenery. |

### Wave B — P2 (8 units)

| # | Unit | File / fn | Prop key | Footprint | Realm |
|---|---|---|---|---|---|
| B1 | Forge / smith's hearth | extend `prop-pillar.js` → `buildForgeHearth` (beside `buildBrazier`) | `prop:forge-hearth` | 1×1 | all |
| B2 | Shelving / stock-rack | new `prop-stock-rack.js` → `buildPropStockRack` | `prop:stock-rack` | 1×1 | all |
| B3 | Bandstand / commons dais | new `prop-bandstand.js` → `buildPropBandstand` | `prop:bandstand` | 2×2 | all |
| B4 | Mill wheel | new `prop-mill-wheel.js` → `buildPropMillWheel` | `prop:mill-wheel` | 2×2 | Frontier/Gloom |
| B5 | Transformer / power junction | extend `prop-gears.js` → `buildPowerJunction` | `prop:power-junction` | 1×1 | Chrome |
| B6 | Rail fence run | new `prop-rail-fence.js` → `buildPropRailFence` | `prop:rail-fence` | 1×1 tiles | all |
| B7 | Chain-link / turf-line fence | new `prop-chainlink-fence.js` → `buildPropChainlinkFence` | `prop:chainlink-fence` | 1×1 tiles | Chrome |
| B8 | Turnstile bank | new `prop-turnstile-bank.js` → `buildPropTurnstileBank` | `prop:turnstile-bank` | 1×1 | Chrome |

### Wave C — P3 (3 units)

| # | Unit | File / fn | Prop key | Footprint | Realm |
|---|---|---|---|---|---|
| C1 | Pews / worship benches | new `prop-pew-row.js` → `buildPropPewRow` | `prop:pew-row` | 1×1 tiles | all |
| C2 | Loading dock / cargo-bay shell | new `prop-loading-dock.js` → `buildPropLoadingDock` | `prop:loading-dock` | 2×1 | all |
| C3 | Careening frame / ship's-ways | new `prop-careening-frame.js` → `buildPropCareeningFrame` | `prop:careening-frame` | 3×2 | High-Seas |

## Executor contract (per unit)

1. Read `dev/model-qa/creatures/prop-altar.js` (exemplar) and your PLACE-ASSET-QUEUE row.
2. Header first: the **feature checklist** (3–6 features the budget buys) + the **use sentence**
   (what is this object mid-doing?).
3. Author the module. Bake-check yourself (from repo root):
   `node --input-type=module -e "import('./dev/model-qa/probe-lib.js').then(async L=>{const m=await import('./dev/model-qa/creatures/<file>');L.resetGeom();m.<fn>();const{POS}=L.getBuffers();let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<POS.length;i+=3)for(let a=0;a<3;a++){mn[a]=Math.min(mn[a],POS[i+a]);mx[a]=Math.max(mx[a],POS[i+a]);}console.log('tris',POS.length/9,'bbox',mn.map(v=>v.toFixed(3)),mx.map(v=>v.toFixed(3)));})"`
   Builds clean · tris ≤2,000 · floor min-y in [-0.01, 0.08] · bbox sane vs the footprint.
4. Hostile self-review against the laws (silhouette at a squint? one high-value zone? any <0.04u
   feature? use-tell present?) — fix, re-bake.
5. Touch ONLY your unit's file. No registry, no SETS, no gen-place-skins.py, no git, no sub-agents.
6. Report raw data: file path, fn, tri count, bbox, floor-y, feature checklist, self-review verdicts.

## Wiring (orchestrator-owned, one commit per wave)

1. `prop:*` registry entries — `src/ui/theater-figures.js` (pattern at :661–668; `discR` sized per
   footprint). Then `python3 build/check-manifest.py`.
2. Keyword rules — `THEATER_PROP_KEYWORD_RULES` (`src/engine/theater-data.js`, near
   `theaterPropForText` :638) so prop text resolves to the new parts.
3. `REALM_PROPS` entries — `dev/model-qa/realm-props.json` ({name, base, size, cover, crossRealm,
   flavor, summary}; `size` drives `propFootprint` — map footprints against `propFootprint()` in
   `src/ui/theater-boot.js` at wiring time).
4. Dressing rows — `build/gen-place-skins.py` `SCENE_DRESSING_BY_ARCHETYPE` (:277–325): point each
   serving archetype at the new anchor names (e.g. row 3 Market gains the stall frame + shop
   counter; row 5 Hall-of-law gains judge-bench + cell-bars; row 13 Threshold gains the gate) →
   regenerate `data/place-skins.js`.
5. Sheet SETS — `dev/model-qa/ps1-sheet.html` per wave; capture
   `dev/model-qa/sheets/place-parts-wave<N>.png` via `ps1-capture.mjs`.
6. Scale sanity vs `prop-scale-contract.js` where the class exists.

## Verification (numbered; ⊗ = red-first)

1. Per-file bake re-run by the orchestrator (never executor self-report): clean build, tri ≤2k,
   floor gate, bbox vs footprint.
2. ⊗ **Dressing resolution check** (THE WIRING LAW): extend `dev/verify-place-dressing.mjs` — every
   `propNames` entry across all 24 archetype rows resolves to a `REALM_PROPS` entry whose derived
   part carries a live `prop:*` registry key. Prove red on the pre-wiring tree (new names
   unresolvable), green after.
3. ⊗ **Tray render proof**: a minted place whose archetype row carries a new anchor renders it
   through the production `sceneDressingForPlace` → `trayFrom` node path (`verify-place-tray.mjs`
   extension or a targeted probe) — not by hand-feeding the prop key.
4. `python3 build/check-manifest.py` → RESULT: OK after every module edit.
5. Harness set per wave: `verify-theater-figures.mjs` · `verify-place-dressing.mjs` ·
   `verify-place-tray.mjs` · `verify-place-skins.mjs` · `verify-theater-data.mjs`.
6. Contact sheet eyes-on per wave (orchestrator reads the PNG — ≥3 models + every self-flagged
   doubt; silhouette/value judged by eye, red models re-queued with the gate note).
7. Full `dev/verify-*.mjs` sweep at the morning close, zero new failures vs the wave-start baseline.
