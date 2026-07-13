# vendor/clipper2-ts — pinned Clipper2 offset kernel (Unit G3)

**Package:** `clipper2-ts` (npm)
**Version pinned:** `2.0.1-18` (no tagged GitHub release exists at research time — pin is the npm
package version + its recorded `gitHead`, per `dev/geometry-tools/pins.json`'s own note under
`geometryCandidates.clipper2-ts`)
**License:** BSL-1.0 (Boost Software License 1.0) — see `LICENSE.md` in this folder, copied verbatim
from the npm package (`Author: Angus Johnson`, per each source file's own header comment). The upstream
C++ reference project (`AngusJohnson/Clipper2`, which this package ports to TypeScript) carries the
identical Boost text — reproduced separately in `LICENSE-UPSTREAM.md` per
`docs/GEOMETRY-OSS-INTEGRATION.md` §14's "retain the upstream license beside the vendored source" rule.
**Upstream (this port):** https://github.com/countertype/clipper2-ts
**Upstream (the C++ reference library this ports):** https://github.com/AngusJohnson/Clipper2
**npm registry integrity (recorded in `dev/geometry-tools/pins.json` →
`geometryCandidates.clipper2-ts`, researched 2026-07-12 by Unit R0, re-verified live at vendoring time
via `npm pack clipper2-ts@2.0.1-18` — shasum and integrity matched the pinned record exactly):**
`sha512-WuRO1ZHzyYTVHY78r4wVWVydvQ+1lx9qZ+DeZa/8zhvrxIgCVzElJ6lwSMGtUUKFPefhvfJsHZ5C9RNkgisCOQ==`
**npm `gitHead` (pinned commit on the `countertype/clipper2-ts` repo):**
`bf6e0303217bdffcbe2f03ab7f6218194df8e7e4` — re-verified live at vendoring time: this is also the
`main` branch's exact HEAD commit on GitHub as of 2026-07-13 (`git ls-remote`/commits API both return
the same SHA), so the vendored source and the public repository tip are the same commit even though no
version tag exists.
**R1 ruling:** `dev/geometry-research/bakeoff/ruling.json` — `"wallOffset": "clipper2-ts"` (the
boolean-union kernel stays `polygon-clipping`; Clipper2 is adopted specifically for its `inflatePaths`
polygon-offset primitive, which `polygon-clipping` does not provide at all). See also
`dev/geometry-research/bakeoff/wall-offset-mapping-report.json`'s `criticalFinding` (CLIPPER_SCALE
integer quantization is MANDATORY — sub-1.0-world-unit float deltas silently no-op) and
`genesisBaselineFinding` (the current per-segment wall construction has a measured ~0.3111-world-unit
outer-corner gap at an ordinary 90° corner, default 0.22 thickness — the defect G3 retires).

## Source of the vendored files — auditable multi-file ESM, not the minified bundle

`clipper2-ts@2.0.1-18` publishes **two** self-contained runtime shapes in its npm tarball:

- `dist/clipper2.min.mjs` — a single-file **minified** bundle (no imports, but unreadable/opaque);
- `dist/index.js` + eight sibling `dist/*.js` files (`Core.js`, `Engine.js`, `Offset.js`, `RectClip.js`,
  `Minkowski.js`, `Triangulation.js`, `Shewchuk.js`, `Clipper.js`) — the package's own **compiled-but-
  unminified** ESM output, each importing only its sibling files by plain relative specifier
  (`import { ... } from './Core.js'`, etc.), with zero bare-specifier / `node_modules` imports anywhere
  in this reachable set (verified live: `grep -n "^import" dist/*.js` across the whole package — every
  hit resolves to another file in this same list).

Unlike `polygon-clipping@0.15.7` (whose only fully self-contained artifact was its official UMD
bundle — see `vendor/polygon-clipping/README-GENESIS.md`), `clipper2-ts` needs **no UMD→ESM rewrite at
all**: its ordinary `dist/*.js` build output already is plain, self-resolving ESM. Per
`docs/GEOMETRY-OSS-INTEGRATION.md` §14.5 ("prefer an auditable ESM source file over an opaque bundle
when practical"), this vendoring uses that multi-file, unminified, human-readable source — **not** the
minified `.mjs` bundle — even though it's nine files instead of one.

**Files copied verbatim, byte-for-byte, from the npm tarball's `dist/` folder** (`npm pack
clipper2-ts@2.0.1-18`, sha256-verified per-file against the extracted tarball at vendoring time — every
copy matched):

```
index.js         (package.json "exports"["."]["import"] entry point)
Core.js
Engine.js
Offset.js
RectClip.js
Minkowski.js
Triangulation.js
Shewchuk.js
Clipper.js
```

**Not vendored** (present in the npm tarball but unreachable from `index.js`'s own import graph — no
file above ever imports from `dist/cdt/`, confirmed by the same live grep):

- `dist/cdt/SweepCDT.js`, `dist/cdt/predicates.js` — an alternate/unused CDT triangulation path;
- `dist/clipper2.min.mjs` (+ its `.map`) — the minified bundle, superseded by the readable source above;
- every `*.d.ts` / `*.d.ts.map` / `*.js.map` — TypeScript type declarations and sourcemaps, dev/IDE
  tooling only, never loaded at runtime (§14.6: "do not include tests, docs, benchmarks, or package-
  manager debris that runtime does not need");
- `src/*.ts` (the pre-compile TypeScript source) and `README.md` — not runtime-loaded.

No file's content was modified in any way — every import statement, comment, and the `Author: Angus
Johnson` header block in each file are preserved exactly as published. `LICENSE.md` in this folder is
the npm package's own `LICENSE` file, copied verbatim.

## Consumption

`src/ui/geometry/polygon-kernel.js` imports `index.js` via a plain relative ES import
(`import * as Clipper2 from "../../../vendor/clipper2-ts/index.js"`) and is the ONLY module in `src/`
that touches it — `offsetRuns`/`wallOffset` (the kernel's own new exported functions, Unit G3) convert
to/from Clipper2's own integer `Point64` (`{x,y}`) convention internally; no library-native
`Point64`/`Path64`/`PolyTree64` type ever escapes the kernel, matching the same "no library-native type
may escape this module" rule G1 already established for `polygon-clipping`/`earcut`
(`docs/GEOMETRY-OSS-INTEGRATION.md` §4).

**CLIPPER_SCALE is mandatory.** `inflatePaths` operates on 64-bit integer coordinates
(`Point64`/`makePath` truncate to integers); passing Genesis's native sub-1-unit world coordinates
(e.g. wall thickness 0.22) directly produces a **silent zero-offset no-op** — verified live both by the
R1 bakeoff (`wall-offset-mapping-report.json` → `criticalFinding`) and independently re-verified at
vendoring time against this exact vendored copy (`node -e "import('./vendor/clipper2-ts/index.js')...`
— an unscaled `inflatePaths([...], 0.22, ...)` call returns the input ring unchanged; the same call at
`CLIPPER_SCALE=4096` correctly offsets by `901/4096 ≈ 0.21997`). `PolygonKernel`'s
`offsetRuns`/`wallOffset` always scale in/out at a fixed integer `CLIPPER_SCALE` — see that module's own
header comment for the exact constant and rationale.

## Do not hand-edit

Never edit any file in this folder to make a Genesis test pass — all coordinate conversion,
canonicalization, and policy belongs in `polygon-kernel.js`
(`docs/GEOMETRY-OSS-INTEGRATION.md` §14's explicit rule). To bump the pin: update
`dev/geometry-tools/pins.json`'s `geometryCandidates.clipper2-ts` entry (fresh research pass, not a
silent edit), `npm pack clipper2-ts@<new-version>` into a scratch directory, re-copy the same nine
`dist/*.js` files verbatim (re-checking the import graph still excludes `cdt/` and stays bare-specifier-
free), and update this README's version/integrity/gitHead fields.
