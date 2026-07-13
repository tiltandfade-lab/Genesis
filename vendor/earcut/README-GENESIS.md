# vendor/earcut — pinned Earcut triangulator (Unit G1)

**Package:** `earcut` (npm)
**Version pinned:** `3.2.3` (tagged GitHub release `v3.2.3`)
**License:** ISC (Copyright (c) 2026, Mapbox) — see `LICENSE` in this folder, copied verbatim from
the npm package.
**Upstream repository:** https://github.com/mapbox/earcut
**npm registry integrity (recorded in `dev/geometry-tools/pins.json` → `geometryCandidates.earcut`,
researched 2026-07-12 by Unit R0):**
`sha512-vnS4AVwp1KHAF13i1vp1/2D5evWy3k5u/iW/B81QVsUZtV8cv2tU0b2VNFlqvh4kYwrFMDdjPCfAmfyJW9y14Q==`
**npm `gitHead` (pinned commit on the `earcut` repo):** `f183d7a06535290bc22163ca5ca2248e4d5a04c5`
**R1 ruling:** `dev/geometry-research/bakeoff/ruling.json` selects `earcut` as the triangulator
(`"triangulator": "earcut"`), proven against the 52-fixture corpus in the four-path bakeoff (P1/P2
paths, `dev/geometry-research/bakeoff/`), 48/52 fixtures fully passing with zero purely-triangulator
correctness failures (the 4 P2 failures are all wall/aperture-derivation concerns, out of scope for
this floor-triangulation candidate — see `dev/geometry-research/bakeoff/correctness-report.json`).

## Source of the vendored file

`earcut.js` in this directory is a **byte-for-byte copy** of the npm package's own auditable ESM
source entry point, `earcut@3.2.3`'s `src/earcut.js` (the package's own `"exports"` field points
here directly — `earcut@3.2.3` ships source, not just a bundled `dist/`). Copied from the pinned
install materialized at `GEOMETRY_TOOLS_HOME` (`~/.genesis-geometry-tools/node_modules/earcut/src/earcut.js`
per `dev/geometry-tools/README.md`'s scratch-home convention) on 2026-07-13 (Unit G1).

**Zero modifications.** The file is a pure ES module with no imports (self-contained, no runtime
dependencies of its own) and already exports exactly what Genesis needs:

- `export default function earcut(data, holeIndices, dim = 2)` — the triangulator itself.
- `export function flatten(data)` — GeoJSON-style ring array → Earcut's flat-array input shape.
- `export function deviation(...)` — triangulation-quality diagnostic (not currently consumed by
  `polygon-kernel.js`, kept for a future diagnostics need).
- `export function refine(...)` — optional post-pass Delaunay legalization (not currently consumed).

No files from `dist/`, `test/`, `bench/`, `viz/`, or the package's `README.md`/`.d.ts` were vendored
— only the single auditable source file plus its license, per
`docs/GEOMETRY-OSS-INTEGRATION.md` §14 ("do not include tests, docs, benchmarks, or package-manager
debris that runtime does not need").

## Consumption

`src/ui/geometry/polygon-kernel.js` imports this file via a plain relative ES import
(`import earcutDefault, { flatten } from "../../../vendor/earcut/earcut.js"`) — works identically
under Node (the pure kernel harnesses, `dev/verify-polygon-kernel.mjs` and
`dev/verify-geometry-fixtures.mjs`) and in-browser (the existing `theater-boot.js` ES-module island;
no importmap entry needed since the import is a relative path, not a bare specifier).

## Do not hand-edit

Never edit the algorithm code in `earcut.js` to make a Genesis test pass — all coordinate conversion,
canonicalization, and policy belongs in `polygon-kernel.js` (`docs/GEOMETRY-OSS-INTEGRATION.md` §14's
explicit rule). To bump the pin: update the version in `dev/geometry-tools/pins.json`'s
`geometryCandidates.earcut` entry (with a fresh research pass, not a silent edit), reinstall into
`GEOMETRY_TOOLS_HOME`, re-copy `src/earcut.js` verbatim over this file, and update this README's
version/integrity/gitHead fields.
