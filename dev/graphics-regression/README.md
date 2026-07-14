# dev/graphics-regression/ — R4: deterministic capture-region regression

Unit R4 of `docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` §13.7 (Phase 0, `docs/GRAPHICS-CONVERGENCE-PLAN.md`
"Wave B"). New paths only — no production `src/` edits, no edits to `dev/geometry-tools/`,
`dev/geometry-research/`, or `dev/graphics-research/` (Codex's lanes; read-only references from here).

## Charter statement (`docs/GRAPHICS-CONVERGENCE-CHARTER.md` §7, §5)

- **Rung enabling.** This is a same-environment regression net so visual work doesn't silently break
  topology/silhouette. It does not itself advance a C0–C8 rung; it makes later rungs verifiable.
- **Canonical contracts preserved.** Dev-only. Drives the real, unmodified `genesis.html`/`src/` through
  `page.evaluate()` calls to already-public functions and `window.Theater` test seams — the same calling
  convention `dev/battle-gate/capture-stage-c3-shapes.mjs` already uses. Never edits production code,
  never mutates narrative RNG, never commits over a golden without a written reason (see "Replacing a
  golden" below).
- **Goldens are evidence, not authority over art direction** (§5's open-source doctrine). Pixel-region
  thresholds catch *drift* from a known-good frame; they say nothing about whether that known-good frame
  is beautiful or converged with the mockups. That judgment belongs to layer 3 (art-direction reads),
  never to this tool.
- **Classification:** research-only.
- **Negative control:** red-first on a one-pixel mutation (`--strict` zero-tolerance) and a small-topology
  shift mutation (production thresholds) — see "Negative control" below.

## The golden hierarchy (`GEOMETRY-ACCELERATION-TOOLCHAIN.md` §7.1)

No layer replaces another:

1. **Structural metrics** — `compare-structural.mjs`. Cross-checks this unit's own capture-time
   `structural.json` (roomShape/roomCellCount/w/d/terrain, extracted live from the real
   `spatializePlan`/`interiorBuildBoard` pipeline) against Codex's G0 fixture truth,
   `dev/geometry-research/fixtures/row101-live-dump.json` (read-only reference). Catches "captured the
   wrong room" — a class of bug pixel-diffing alone cannot see (a pixel-perfect capture of the wrong
   fixture still passes a pixel diff against itself).
2. **Pixel regions** — `compare-regions.mjs`. Localized Pixelmatch comparisons under the frozen
   environment `capture-regions.mjs` produces. Catches silhouette/topology/material drift within a named
   region, at a tolerance tuned per-region (see `region-masks/octagon-row101.json`).
3. **Art-direction reads** — human/Codex visual judgment against the approved mockups. Not automated by
   this unit. A green pixel-region report is not license to skip an eyes-on read before calling a visual
   unit converged (charter §7: "A green harness without a read capture does not close a taste-bearing
   graphics unit").

## Files

| file | role |
|---|---|
| `capture-regions.mjs` | the deterministic capture mode. Boots the real app, mounts the row-101 octagon fixture, forces one synchronous render frame, screenshots the canvas, writes `full.png` + `structural.json` + `env.json` under `captures/<label>/`. |
| `lib.mjs` | shared pngjs/pixelmatch loaders (resolved from the pinned `~/.genesis-geometry-tools` tool home, R0's scratch install — never a runtime/shipped dependency) + a `crop()` helper. |
| `region-masks/octagon-row101.json` | the region-mask data (§7.2 format): `{fixtureId, regions:[{id, rect, threshold, maxRatio}]}`, authored once against the verified-correct `captures/golden/full.png`. |
| `compare-regions.mjs` | the pixel-region comparator (layer 2). Same-environment gate (§7.3 cross-GPU policy) + per-region diff output. |
| `compare-structural.mjs` | the structural-metrics comparator (layer 1), cross-checked against G0's truth fixture. |
| `mutate-capture.mjs` | negative-control fixture generator — produces a deliberately-broken **copy** of a capture (`one-pixel` or `shift` mode). Never edits a source capture in place. |
| `run-negative-control.mjs` | orchestrates the full red-first/green-stable proof end to end and asserts the exact RED/GREEN pattern this unit's acceptance requires. |
| `captures/` | capture outputs (`full.png`, `structural.json`, `env.json`, `report.json`) — new, non-conflicting paths, committed like `dev/battle-gate/`'s own capture PNGs. |
| `comparisons/` | comparator outputs (`report.json` + per-region `expected.png`/`actual.png`/`diff.png`). |

## Region masks (`GEOMETRY-ACCELERATION-TOOLCHAIN.md` §7.2)

`region-masks/octagon-row101.json` defines six regions against the "Grand Octagon row 101" fixture
(same semantic fixture as `dev/battle-gate/capture-stage-c3-shapes.mjs`'s `octagon` scene and G0's
`row101-live-dump.json` truth — chosen for cross-reference, not two unrelated scenes):

- `board-silhouette` — whole board footprint against the void.
- `floor-topology` — the floor plane incl. the sunken-arena/dais zig-zag boundary (row 101's two
  structural terrain patches).
- `wall-stem-silhouette` — a back wall run + a doorway stem.
- `practical-fixture-region` — the motivated wall-mounted light emitter (torch glow).
- `subject-readability-region` — open floor near the entry threshold; also nearest the ambient-mote
  field, so it carries the widest tolerance (see "What is NOT fully frozen" below).
- `lower-wall-stem-silhouette` — a second, different wall/doorway assembly, for a second silhouette
  data point.

Rects were read off the known-correct baseline (`captures/golden/full.png`, 652×699) **once**, at
mask-authoring time — never repainted after a later failure (the anti-hand-painting rule §7.2 itself
states). If a capture's canvas backing size ever differs from the mask's recorded
`expectedCanvasSize`, `compare-regions.mjs` prints an explicit warning rather than silently comparing
shifted rects.

## What this freezes, and what it does NOT (§3.8's required list)

Frozen: seed (a fixed hand-authored `walk.segments[]` fixture), viewport + device-scale (fixed
`CAPTURE_W`/`CAPTURE_H`, `deviceScaleFactor:1`, `--force-device-scale-factor`), renderer resolution
(canvas backing size read back and recorded, not assumed), camera + ShotPlan
(`setInteriorVariant({shotCompose:false})` forces the plain full-room camera fit), the animation clock
for the *first* rendered frame (`window.Theater._renderFrameForTest()` called synchronously inside the
same `page.evaluate()` turn as `setInteriorBoard()` — no `requestAnimationFrame` tick can fire in
between), exposure/grade/post (deterministic per fixed `lightProfile`/`realmId`, no extra freeze
needed), font loading (the capture crops to the WebGL `<canvas>` element only, never surrounding DOM
text).

**NOT fully frozen — flagged for the orchestrator:** ambient motes
(`theater-boot.js`'s `startMoteDrift`/`stopMoteDrift`) run on their own internal
`requestAnimationFrame` loop, driven by real wall-clock (`performance.now()`), scheduled at Theater
mount time. Neither a pause nor a disable toggle is exposed on `window.Theater` — only
`_renderFrameForTest()` (render synchronously) and `interiorMoteCount()` (read the count). This script
minimizes drift by never `await`-ing between board-mount and the first forced render, but cannot
*guarantee* zero mote-position drift between two separate process launches (CDP round-trip jitter, OS
scheduling). **Measured real-world impact** (see `comparisons/rerun-vs-golden/report.json` from a real
run): 0–1 mismatched pixels total across all six regions on an unchanged recapture — i.e. the frozen
first-frame protocol is, empirically, extremely stable, but not proven zero by construction. If a
future R4-adjacent unit needs byte-exact reproducibility, the missing piece is a
`window.Theater.setMoteDriftDisabledForTest` seam (or equivalent) on the production side — flagged
here, not built here (out of this unit's edit scope).

## Cross-GPU policy (§7.3)

`compare-regions.mjs` checks `env.json` on both captures being compared. If `canvasBackingSize`,
`glInfo.unmaskedRenderer`, `browserVersion`, `pixelmatchVersion`, or `platform` differ, it does **not**
apply the mask's tight same-environment thresholds. Instead it widens `threshold`×3 (capped 0.35) and
`maxRatio`×5 (capped 0.5), prints an explicit `CROSS-GPU POLICY ACTIVE` warning, and reports
`"WARNING-CROSS-ENV"` as the verdict rather than a hard PASS/FAIL — matching §7.3's "explicit warning
rather than automatic golden replacement." It never auto-replaces a golden under any policy.

## Negative control

`run-negative-control.mjs` runs, in order, and asserts the exact pattern below (see
`comparisons/negative-control-summary.json` for the machine-readable record of the last run):

1. structural layer, golden vs G0 truth → **GREEN**
2. pixel layer, unchanged recapture (`rerun`) vs `golden` → **GREEN** (measured: 0–1 stray px per
   region, all within tolerance)
3. pixel layer, a single flipped pixel (`mutate-capture.mjs --mode one-pixel`) vs `golden`, compared
   with `--strict` (zero tolerance) → **RED**, and — precisely — RED *only* in the regions that
   geometrically contain that one pixel (`board-silhouette`, `wall-stem-silhouette`,
   `practical-fixture-region`); the three regions that don't contain it stay GREEN. This is the
   byte-level sensitivity proof.
4. pixel layer, a 6px topology shift (`mutate-capture.mjs --mode shift`) inside
   `wall-stem-silhouette` vs `golden`, compared under **production thresholds** (no override) → RED in
   `wall-stem-silhouette` (3.07% mismatch vs its 1% maxRatio) and the overlapping
   `practical-fixture-region` (4.56% vs 3%); the four regions outside the shifted area stay under
   their own thresholds. This is the realistic "a wall/floor boundary nudged a few px" regression case
   the whole unit exists to catch, caught at the mask's real intended tolerance — no diagnostic
   override needed.

## Running it

```
node dev/graphics-regression/capture-regions.mjs --out golden
node dev/graphics-regression/capture-regions.mjs --out rerun
node dev/graphics-regression/compare-structural.mjs --capture golden
node dev/graphics-regression/compare-regions.mjs --fixture octagon-row101 --expected golden --actual rerun
node dev/graphics-regression/run-negative-control.mjs   # runs everything above + both mutation proofs
```

Chrome via `puppeteer-core`, resolved from `~/.genesis-jsdom/node_modules/puppeteer-core` — same
resolution convention every `dev/battle-gate/capture-*.mjs` script already uses (system Chrome at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`). `pngjs`/`pixelmatch` resolve from R0's
pinned scratch tool home, `~/.genesis-geometry-tools` (`GEOMETRY_TOOLS_HOME` env var to override).
Server ports: 5281–5285 (a range distinct from every existing `dev/battle-gate/*.mjs` /
`dev/model-qa/capture.mjs` port range at authoring time).

## Replacing a golden

Never done automatically by any script here. If `captures/golden/` is intentionally regenerated
(a real, approved visual change to the row-101 octagon fixture), the replacement needs, in the commit
message: (1) the reason, (2) the specific regions expected to change and why, (3) confirmation the new
`full.png` was visually inspected — not just that `compare-regions.mjs` was skipped. Agents may not
overwrite `captures/golden/` to make a gate green (`docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` §3.8).
