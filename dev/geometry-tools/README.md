# Geometry research tools (R0)

Scratch-home bootstrap and smoke tests for the geometry-acceleration research program's Phase-0 dev
tools (`docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` S1.3, S11, S13.3). This is research/build-time
tooling only — nothing here is imported by `genesis.html`, listed in `manifest.json`, or shipped in
the production asset bundle. See `docs/GRAPHICS-CONVERGENCE-CHARTER.md` S5-S6 for the open-source
adoption doctrine and no-human production contract this program serves.

## Files

| File | Job |
| --- | --- |
| `pins.json` | machine-readable pin ledger — exact package/version/license/commit/integrity for every candidate this research program has looked at so far |
| `LEDGER.md` | human-readable ledger: rulings, research findings, reconciliation against Codex's `dev/graphics-research/toolchain.json`, and the S12 security/licensing checklist |
| `setup.mjs` | installs the pinned Phase-0 dev tools into `GEOMETRY_TOOLS_HOME` |
| `smoke-imports.mjs` | imports each installed tool and asserts one real operation; emits a reproducibility receipt |
| `smoke-receipt.json` | output of the last `smoke-imports.mjs` run (git-ignored — regenerate, don't hand-edit) |

## The `GEOMETRY_TOOLS_HOME` convention

Mirrors the existing `~/.genesis-jsdom` precedent (see root `CLAUDE.md`'s headless-test row) and
`dev/graphics-research/`'s `GRAPHICS_RESEARCH_HOME` pattern:

```
GEOMETRY_TOOLS_HOME=${GEOMETRY_TOOLS_HOME:-$HOME/.genesis-geometry-tools}
```

Everything installed by `setup.mjs` — `package.json`, `package-lock.json`, `node_modules/` — lives
**outside the repo**, in that scratch directory. The repo gains zero new dependencies, zero root
`package.json`, zero root `node_modules`. Harnesses resolve tools from the scratch home via
`createRequire`, exactly like the jsdom precedent.

Override the location with the env var if you want an isolated or disposable install:

```sh
GEOMETRY_TOOLS_HOME=/tmp/scratch-geometry-tools node dev/geometry-tools/setup.mjs
```

## Running setup

```sh
# Install the 3 required Phase-0 tools (fast-check, webgl-lint, pixelmatch):
node dev/geometry-tools/setup.mjs

# Also install the optional spectorjs pin:
node dev/geometry-tools/setup.mjs --with-spector
# or:
GEOMETRY_TOOLS_INCLUDE_SPECTOR=1 node dev/geometry-tools/setup.mjs
```

`setup.mjs` runs `npm install --save-exact --ignore-scripts` against the exact pinned versions in
`pins.json`, then re-reads each installed `package.json` to confirm the resolved version matches the
pin exactly (a resolver substitution is treated as a hard failure, not a warning). It never fabricates
a successful install — if `npm install` fails (network blocked, registry unreachable, etc.) it prints
the real npm stderr and exits non-zero.

## Running the smoke test

```sh
node dev/geometry-tools/smoke-imports.mjs
```

One check per Phase-0 tool:

- **fast-check** — runs a tiny property (`fc.assert(fc.property(...))`, 25 generated cases, fixed
  seed) and confirms all 25 cases actually executed.
- **webgl-lint** — confirms the module resolves, imports, and exposes a recognizable export surface.
  `webgl-lint` is authored to wrap a live browser WebGL context; there is no WebGL context in plain
  Node, so the deeper claim — "wraps the exact context `theater-boot.js` creates without changing
  renderer behavior" (docs S3.6) — is R3's job (WebGL diagnostics unit), not R0's.
- **pixelmatch** — diffs a 2x2 black buffer against a 2x2 white buffer (expects all 4 pixels to
  mismatch) and the black buffer against itself (expects 0 mismatches).
- **spectorjs** *(optional)* — if installed, resolves and version-checks the package via its
  `package.json` directly (so a version/integrity mismatch is still a hard failure even before any
  import is attempted), then attempts the import. spectorjs's only published entry point
  (`dist/spector.bundle.js`) is a **browser-only UMD bundle that references the `self` global at
  module-evaluation time** — there is no Node-compatible entry point at all. That import will throw
  `ReferenceError: self is not defined` in plain Node; this is recorded as an explicit **SKIP**
  (`status: "skipped-browser-only"`), never silently swallowed and never reported as a PASS.
  Functionally smoke-testing Spector needs a DOM (jsdom) or real-browser harness — that's R3's
  standalone-capture spike (docs S13.6), not R0's job.

### Exit codes and what they mean

- **0** — every required tool passed (optional tools may be skipped or skipped-browser-only).
- **1** — one of: (a) a required tool genuinely failed (wrong version, missing export, unexpected
  error), or (b) *every* check skipped because the tool home doesn't exist at all (network was
  blocked, or `setup.mjs` was never run). Case (b) exists specifically so an empty tool home can never
  be mistaken for a green run by CI or an orchestrating agent.

### Dep-aware skip posture

This mirrors Genesis's existing CI dep-aware-skip posture (see the project auto-memory entry "CI
posture (greened 2026-07-12)": render/paint harnesses auto-skip via a dep-aware loop rather than a
hand-maintained skip-list). A missing optional tool, or a tool with no Node-compatible entry point,
is reported as `SKIP` with an explicit reason string — never silently, never as a fake `PASS`.

## Reproducibility receipt

Every `smoke-imports.mjs` run writes `dev/geometry-tools/smoke-receipt.json` (git-ignored) and prints
the same JSON to stdout:

```json
{
  "node": "...",
  "platform": "...",
  "toolHome": "...",
  "packages": { "<name>": { "version": "...", "integrity": "...", "status": "pass|fail|skipped|skipped-browser-only" } },
  "upstreamCommits": {},
  "licenses": { "<name>": "<SPDX id>" },
  "generatedAt": "<ISO timestamp>",
  "gitCommit": "...",
  "gitBranch": "..."
}
```

## What's NOT installed here

`setup.mjs` only materializes the four Phase-0 **dev** tools. The geometry candidates
(`polygon-clipping`, `earcut`, `clipper2-ts`, `robust-predicates`) and the build-time candidates
(JSCAD, Manifold, glTF Transform, glTF Validator, `stats-gl`, `potpack`, `poisson-disk-sampling`) are
recorded in `pins.json` / `LEDGER.md` for **provenance only** — R1 (four-path geometry bakeoff), R5
(procedural backend bakeoff), and R8 (glTF pipeline) own actually installing and spiking those, per
`docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` S13.4/S13.8/S13.11.

## Regenerating

Nothing here is generated from another source — `pins.json` is hand-researched from the npm registry
and GitHub API and should be updated deliberately (with a new research pass, not silently) if a pin
needs to move. If you touch a package version already pinned in
`dev/graphics-research/toolchain.json` (currently: `stats-gl`, `potpack`, `poisson-disk-sampling`),
update that file too and say so in the commit — those three are Codex's owned lane; see `LEDGER.md`
"Reconciliation" section.
