# vendor/polygon-clipping — pinned polygon-clipping boolean kernel (Unit G1)

**Package:** `polygon-clipping` (npm)
**Version pinned:** `0.15.7` (no tagged GitHub release exists at research time — pin is the npm
package version + its recorded `gitHead`, per `dev/geometry-tools/pins.json`'s own note)
**License:** MIT (Copyright (c) 2018 Mike Fogel; Copyright (c) 2016 Alexander Milevski for the
forked-from `w8r/martinez` portions) — see `LICENSE.md` in this folder, copied verbatim from the npm
package. Two additional licenses are reproduced in `LICENSE-THIRD-PARTY.md` for code this package's
own official build statically inlines (splaytree, MIT; the `orient2d` robust-predicate routine,
Unlicense) — see that file for detail.
**Upstream repository:** https://github.com/mfogel/polygon-clipping
**npm registry integrity (recorded in `dev/geometry-tools/pins.json` →
`geometryCandidates.polygon-clipping`, researched 2026-07-12 by Unit R0):**
`sha512-nhfdr83ECBg6xtqOAJab1tbksbBAOMUltN60bU+llHVOL0e5Onm1WpAXXWXVB39L8AJFssoIhEVuy/S90MmotA==`
**npm `gitHead` (pinned commit on the `polygon-clipping` repo):**
`25f2a460ca7bd750d958d3d83b0037a32fcf75f6`
**R1 ruling:** `dev/geometry-research/bakeoff/ruling.json` selects `polygon-clipping` as the boolean
kernel (`"booleanKernel": "polygon-clipping"`), proving it over `clipper2-ts` on the 52-fixture
bakeoff corpus — both hit the same 48/52 floor-correctness pass rate, but `polygon-clipping` was
consistently faster (`performance-report.json`) and needed no integer-quantization scale parameter
(`clipper2-ts` silently no-ops sub-1.0-unit offsets without one — a correctness trap this candidate
doesn't have).

## Source of the vendored file — and why it isn't a raw source copy

Unlike `earcut` (which ships an auditable single-file ESM source at its package `"exports"` root),
`polygon-clipping@0.15.7`'s published package ships **only build artifacts** — `dist/*.cjs.js` /
`dist/*.esm.js` / `dist/*.umd.js` — no `src/` in the npm tarball. Its real ESM build
(`dist/polygon-clipping.esm.js`) imports its two runtime dependencies as **bare specifiers**
(`import SplayTree from 'splaytree'`, `import { orient2d } from 'robust-predicates'`), which cannot
resolve in a plain relative-import, no-bundler, no-import-map vendoring layout (`docs/
GEOMETRY-OSS-INTEGRATION.md` §14 forbids a package-manager runtime dependency; there is no root
`package.json`/`node_modules` in this repo for Node module resolution to walk).

The one build artifact that IS fully self-contained is `dist/polygon-clipping.umd.js` — polygon-
clipping's own official rollup build **statically inlines** both `splaytree` and the `orient2d`
routine (verified live: zero `require(`/bare `import` statements anywhere in that file). This is the
artifact vendored here, **byte-identical in its algorithm body** to the npm package's own published
`dist/polygon-clipping.umd.js` — the only change is mechanical UMD→ESM re-wrapping (below), never an
edit to the algorithm itself, per §14's "never edit vendored algorithm code" rule.

## The UMD→ESM transform (the only modification made)

`dist/polygon-clipping.umd.js` is a UMD wrapper:

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.polygonClipping = factory());
})(this, (function () { 'use strict';
  ... 2480+ lines of algorithm body ...
  return index;
}));
```

`polygon-clipping.js` in this directory keeps that entire algorithm body **verbatim** (same lines,
same whitespace, same comments — including the preserved splaytree/Microsoft-generator-helper license
comments near the top) and replaces only:

- the outer `(function (global, factory) { ... })(this, (function () { 'use strict';` wrapper open →
  a plain `'use strict';` directive plus a short provenance comment (this file's own header);
- the closing `return index;\n\n}));` → `export default index;`.

This makes the file a real static ES module — `import polygonClipping from "./polygon-clipping.js"`
resolves identically under plain Node (`dev/verify-polygon-kernel.mjs`,
`dev/verify-geometry-fixtures.mjs`) and in-browser (the existing `theater-boot.js` ES-module island),
with zero bundler, zero import-map entry, and zero `node_modules` dependency. Verified live at
vendoring time (Unit G1, 2026-07-13): `pc.union(...)` over three unit-square cells correctly returns
one merged L-shaped polygon; `pc.union(...)` over an 8-cell donut (3×3 minus center) correctly returns
one polygon with 2 rings (outer + hole).

## Consumption

`src/ui/geometry/polygon-kernel.js` imports this file via a plain relative ES import
(`import polygonClipping from "../../../vendor/polygon-clipping/polygon-clipping.js"`) and is the ONLY
module in `src/` that touches it — no library-native return shape from `polygonClipping.union/
intersection/xor/difference` escapes the kernel (see `docs/GEOMETRY-OSS-INTEGRATION.md` §4's "no
library-native type may escape this module" rule).

## Do not hand-edit

Never edit the algorithm body in `polygon-clipping.js` to make a Genesis test pass — all coordinate
conversion, canonicalization, and policy belongs in `polygon-kernel.js`
(`docs/GEOMETRY-OSS-INTEGRATION.md` §14's explicit rule). To bump the pin: update
`dev/geometry-tools/pins.json`'s `geometryCandidates.polygon-clipping` entry (fresh research pass, not
a silent edit), reinstall into `GEOMETRY_TOOLS_HOME`, re-derive this file from the new
`dist/polygon-clipping.umd.js` with the same mechanical UMD→ESM transform (strip the wrapper, add
`export default index;` — never touch anything between those two edits), and update this README's
version/integrity/gitHead fields plus `LICENSE-THIRD-PARTY.md`'s inlined splaytree version if it
changed.
