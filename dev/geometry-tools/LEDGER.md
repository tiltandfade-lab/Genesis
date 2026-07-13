---
type: research-ledger
project: Genesis
status: RESEARCH
updated: 2026-07-12
unit: R0 (dependency ledger + tool bootstrap)
parent: docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
---

# Geometry tools dependency ledger (R0)

## Charter S7 statement

- **Convergence rung:** enabling — this is instrumentation foundation for C0 (topology correctness)
  and the no-human production contract (`docs/GRAPHICS-CONVERGENCE-CHARTER.md` S6). It advances no
  rung by itself; it makes R1-R9 possible.
- **Canonical contracts preserved:** touches zero production `src/`. The walk, cards, and cells are
  neither read nor changed by anything in this directory.
- **Classification:** research / build-time tooling only. Nothing here ships in `genesis.html` or
  the production asset bundle.
- **Negative control:** `smoke-imports.mjs` fails loudly (non-zero exit, explicit stderr) if a pinned
  package is missing, resolves to the wrong version, or fails its one-line functional assertion. It
  never silently downgrades a failure to a warning.

This ledger is the source-of-truth companion to `docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` S2 (research
ledger), S11 (dependency/tool isolation), S12 (security/licensing gate), and S13.3 (R0 deliverables).
Machine-readable pins live in `dev/geometry-tools/pins.json`; this file explains the rulings and any
research findings that update or sharpen the parent doc's initial guesses.

All data below was pulled live from the npm registry and GitHub API on 2026-07-12. `npm ping` and the
registry were reachable in this sandbox — see "Install status" for whether the actual install ran.

## Reconciliation against `dev/graphics-research/toolchain.json`

Codex's executed compat baseline (`dev/graphics-research/toolchain.json`) already pins three packages
that also appear in this unit's build-time-candidate scope: `stats-gl`, `potpack`,
`poisson-disk-sampling`. This ledger copies those exact versions (`4.2.3`, `2.1.0`, `2.3.1`) verbatim —
**no contradiction, no re-pin.** If a future wave needs to bump one of those three, the change belongs
to Codex's `dev/graphics-research/` lane, not here.

Every other package in this ledger (fast-check, webgl-lint, pixelmatch, spectorjs, polygon-clipping,
earcut, clipper2-ts, robust-predicates, JSCAD, Manifold, glTF Transform, glTF Validator) is outside
`toolchain.json`'s scope (that file covers the render-layer candidates: three, three-gpu-pathtracer,
three-mesh-bvh, xatlas, sharp) and introduces no overlap.

## Phase-0 dev tools (installed by `setup.mjs`)

These four are the only packages this unit actually materializes into `GEOMETRY_TOOLS_HOME`. All are
dev-only per charter S1.3 — none is a runtime dependency of Genesis.

| Package | Pinned version | License | Upstream repo | Required | Ruling |
| --- | --- | --- | --- | --- | --- |
| `fast-check` | 4.9.0 | MIT | github.com/dubzzz/fast-check | yes | ADOPT AFTER SMOKE |
| `webgl-lint` | 1.11.4 | MIT | github.com/greggman/webgl-lint | yes | ADOPT AFTER SMOKE |
| `pixelmatch` | 7.2.0 | ISC | github.com/mapbox/pixelmatch | yes | ADOPT AFTER SMOKE |
| `spectorjs` | 0.9.30 | MIT | github.com/BabylonJS/Spector.js | no (optional) | SPIKE |

Exact commit (`npmGitHead`), integrity hash, and unpacked size for each are recorded in `pins.json`.

### Research findings that sharpen the parent doc

- **`webgl-lint` license verification.** The parent doc's S2 table doesn't flag a license concern for
  `webgl-lint`, but GitHub's repo-metadata API reports `NOASSERTION` for this repo (a license-detection
  artifact, not an actual absence of license — the repo root does carry `LICENSE.md`). The npm-published
  `package.json` for `webgl-lint@1.11.4` declares `MIT` directly, which is the operative artifact for
  what actually gets installed. Recorded as `licenseNote` in `pins.json`; not a blocker.
- **`spectorjs` staleness confirmed and quantified.** The parent doc (S3.7) says "the latest tagged
  release shown by GitHub is substantially older than the MCP source." Confirmed and dated: latest
  GitHub tag is `v0.9.27` (commit `b97bc856…`), the npm-published `0.9.30` sits on a newer, untagged
  commit (`af134638…`), and the `master` branch HEAD (`97927a00…`, dated 2026-07-04) is newer still.
  This ledger pins the npm-published standalone package (`0.9.30`) for R0's smoke test only — it does
  **not** pin an MCP-source commit. Per the parent doc, standalone capture and MCP integration are two
  separate spikes; MCP-source pinning is R3's job at spike time, not R0's.
- **`spectorjs` is optional in `setup.mjs`.** The task brief lists Spector.js as "optional"; the ledger
  table in the parent doc marks it `SPIKE` rather than `ADOPT AFTER SMOKE` like the other three. R0
  installs it only when explicitly requested (`--with-spector` or `GEOMETRY_TOOLS_INCLUDE_SPECTOR=1`),
  and the smoke test dep-aware-skips it when absent, matching Genesis's existing CI dep-aware-skip
  posture (see `MEMORY.md` "CI posture (greened 2026-07-12)").

## Geometry candidates (provenance only — not installed by this unit)

R1 (four-path geometry bakeoff) owns actually spiking these. R0 records exact pins now so R1 does not
have to re-derive provenance.

| Package | Pinned version | License | Tagged release? | Ruling |
| --- | --- | --- | --- | --- |
| `polygon-clipping` | 0.15.7 | MIT | none found on GitHub at research time | BASELINE |
| `earcut` | 3.2.3 | ISC | `v3.2.3` | BASELINE |
| `clipper2-ts` | 2.0.1-18 | BSL-1.0 | **none** — pin the npm `gitHead` commit | SPIKE |
| `robust-predicates` | 3.0.3 | Unlicense | `v3.0.3` | SPIKE |

### Research findings

- **`clipper2-ts` package name.** The parent doc's S2/S3.3 explicitly warns: "Do not rely on a
  deprecated scoped npm package name; verify the current unscoped package and source repository at
  spike time." Verified: the live, currently-published package **is already** the unscoped
  `clipper2-ts` (publisher `countertype`), confirming the doc's caution was correctly aimed but the
  unscoped name is already what's live — there is no separate `@countertype/clipper2-ts` in current
  use to avoid. No tagged GitHub release exists; the npm-published `2.0.1-18` carries `gitHead
  bf6e0303217bdffcbe2f03ab7f6218194df8e7e4`, which R1 should treat as the pinned commit.
  Boost Software License 1.0 confirmed on both the JS port and the upstream native `AngusJohnson/Clipper2`
  reference project — retain both license/notice files if this candidate is ever vendored (charter S12).
- **`polygon-clipping` and `earcut`** both resolve cleanly to their npm `latest` with matching
  `gitHead` commits; no license or naming surprises.

## Build-time candidates (provenance only — not installed by this unit)

R5 (procedural backend bakeoff) and R8 (glTF pipeline) own spiking these.

| Package(s) | Pinned version | License | Ruling |
| --- | --- | --- | --- |
| `@jscad/modeling` + `@jscad/io` | 2.13.0 / 2.4.14 | MIT | SPIKE |
| `manifold-3d` | 3.5.1 | Apache-2.0 | SPIKE |
| `@gltf-transform/{core,functions,extensions,cli}` | 4.4.1 (all four) | MIT | STRONG SPIKE |
| `gltf-validator` | 2.0.0-dev.3.10 | Apache-2.0 | ADOPT IF GLTF PATH |
| `stats-gl` | 4.2.3 | MIT | matches `toolchain.json` |
| `potpack` | 2.1.0 | ISC | matches `toolchain.json` |
| `poisson-disk-sampling` | 2.3.1 | MIT | matches `toolchain.json` |

### Research findings

- **`manifold-3d` npm/GitHub version skew.** npm's `dist-tags.latest` is `3.5.1`, but GitHub's newest
  release tag is `v3.5.2`. The npm-published artifact is what actually installs, so this ledger pins
  `3.5.1` as the real, installable version — not the newer unpublished-to-npm tag. R5 should re-check at
  spike time in case `3.5.2` has since reached npm.
- **`gltf-validator` prerelease tag.** The npm-published package is at `2.0.0-dev.3.10` — a `-dev`
  prerelease tag is the current live published artifact; there is no non-dev `2.0.0` on npm yet. This
  is normal for this package (it has shipped as `-dev.*` for a long time) and is not a red flag, just
  worth recording so nobody assumes a stable `2.0.0` exists to pin instead.

## Security/licensing gate (charter S12 checklist, applied to Phase-0 tools)

| Check | fast-check | webgl-lint | pixelmatch | spectorjs |
| --- | --- | --- | --- | --- |
| Official repo/package ownership verified | yes (dubzzz org, npm publisher matches) | yes (greggman, npm publisher matches) | yes (mapbox org, npm publisher matches) | yes (BabylonJS org, npm publisher matches) |
| Exact version + commit pinned | yes (4.9.0) | yes (1.11.4, gitHead `fb9b1c61…`) | yes (7.2.0, gitHead `9faed093…`) | yes (0.9.30, gitHead `af134638…`) |
| License preserved | MIT | MIT | ISC | MIT |
| Transitive deps reviewed | shallow — `npm ls` at install time, see `setup.mjs` output | shallow — zero declared runtime deps in package.json | shallow — zero declared runtime deps | shallow — zero declared runtime deps |
| Lifecycle scripts avoided where not required | `npm install --ignore-scripts` used for all four in `setup.mjs` (none of the four need a native build step) | same | same | same |
| Integrity hash recorded | yes, `pins.json` | yes, `pins.json` | yes, `pins.json` | yes, `pins.json` |
| MCP servers local/scoped | N/A for R0 (Spector's MCP source is R3's job, not pinned or run here) | | | |
| No exposure of saves/private repos/unrelated paths | tool home is a fresh directory under `$HOME`, isolated from the repo working tree | | | |
| Diagnostic tooling excluded from release builds | yes — nothing in this unit touches `genesis.html`, `manifest.json`, or any `src/` loadOrder | | | |
| Commercial redistribution obligations reviewed | MIT/ISC — permissive, notice-preservation only. No GPL/AGPL/SSPL candidates encountered in this ledger. | | | |

No license, security, or provenance concern was found that blocks adopting the four Phase-0 dev tools
for development use. The one open item is **`spectorjs`'s staleness** (documented above) — that's a
freshness/maintenance concern for R3 to weigh, not a license or security blocker.

## Install status

See the reproducibility receipt emitted by `smoke-imports.mjs` for the authoritative, timestamped
record of what actually installed in this environment. Summarized in the session report; this ledger
records pins independent of whether the sandbox that ran R0 had network access at the time.
