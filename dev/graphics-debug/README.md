# dev/graphics-debug/ — Unit R3: WebGL diagnostics harness

docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §6 (implementation spec) + §13.6 (deliverables). Parent plan:
docs/GRAPHICS-CONVERGENCE-PLAN.md Phase 0. Parent charter: docs/GRAPHICS-CONVERGENCE-CHARTER.md §7
(session protocol) — the required charter statement lives at the top of
`capture-webgl-diagnostics.mjs`, not duplicated here.

## What this is

A **dev-only, research-only** harness that boots the real Genesis app over localhost, injects
[`webgl-lint`](https://github.com/greggman/webgl-lint) (and optionally
[`spectorjs`](https://github.com/BabylonJS/Spector.js)) BEFORE the renderer creates its WebGL context,
loads a deterministic fixture room through the app's own real code paths (`spatializePlan` ->
`semanticizePlan` -> `interiorBuildBoard` -> `window.Theater.setInteriorBoard` — the same seam every
`dev/battle-gate/capture-*.mjs` harness already uses), renders a named frame, and writes a screenshot
+ a structured diagnostic receipt.

**It never edits production render behavior and never ships in `genesis.html`.** Nothing under `src/`
imports, references, or conditionally loads `webgl-lint` or `spectorjs`. The injection is 100%
harness-side (Puppeteer `evaluateOnNewDocument`, scoped to this script's own browser session). See
`capture-webgl-diagnostics.mjs`'s `checkBootPathAbsence()` for the load-bearing grep proof, run fresh
on every invocation — not a claim made once and left to rot.

## Run it

```
node dev/geometry-tools/setup.mjs --with-spector   # once, if ~/.genesis-geometry-tools doesn't have
                                                     # webgl-lint/spectorjs yet (R0's scratch tool home)
node dev/graphics-debug/capture-webgl-diagnostics.mjs
```

Env:

| var | effect |
|---|---|
| `WGL_PORT` | override the base localhost port (default tries 5291-5295) |
| `WGL_SKIP_CORPUS=1` | run ONLY the negative control (fast iteration on the negative-control path) |
| `WGL_SKIP_NEGCTRL=1` | run ONLY the real corpus (fast iteration on fixture geometry) |
| `GEOMETRY_TOOLS_HOME` | override the R0 scratch tool home (default `~/.genesis-geometry-tools`) |

Output (all **UNCOMMITTED evidence** — never staged, matching every sibling `dev/battle-gate/`
harness's own convention of writing PNGs/JSON that are read, not committed):

- `reports/report.json` — the full run: negative control, boot-path-absence check, Spector standalone
  smoke, Spector MCP feasibility receipt, and one diagnostic-receipt entry per fixture (§6.2 schema).
- `reports/{fixtureId}.png` (or `-yaw-a.png`/`-yaw-b.png` for the two-yaw fixture) — the named frame(s).

Exit code is nonzero if: the negative control did NOT catch the deliberately-injected GL error, ANY
real-corpus fixture reports an unapproved lint error, a fixture failed to build/mount, or the
boot-path-absence check finds a hit.

## The four fixtures (of the §6.3 corpus's 8 — this unit's required floor)

| fixtureId | what it exercises | reused from |
|---|---|---|
| `row101-ring-pit` | Grand Octagon row 101: sunken arena + raised ring (2 real terrain patches) | `dev/battle-gate/capture-stage-c3-shapes.mjs`'s own "octagon" scene, verbatim |
| `octagon-diagonal-doorway` | a Grand Octagon with 4 satellite exits — empirically checked for a door landing adjacent to one of the octagon's own chamfered diagonal wall runs (`diagonalizeStaircaseRing`, `src/ui/theater-room-mesh.js`) | new fixture; verification via the existing `window.Theater._interiorRoomShellForTest()` seam |
| `wall-upper-fade-camera-move` | two camera yaws of the same board (`rotate()` + `setInteriorVariant({})` replay) | `dev/battle-gate/capture-wall-occlusion.mjs`'s own two-yaw sequence, verbatim |
| `wall-mounted-practical` | a wall sconce snapped to a real C4.1a mount slot | `dev/battle-gate/capture-practicals.mjs`'s own `sconce-iron` fixture, isolated to just that family |

The `octagon-diagonal-doorway` fixture's diagonal-adjacency claim is **empirically verified at run
time**, not assumed — see `report.json`'s `fixtures.octagon-diagonal-doorway.diagonalProbe`. If a given
run doesn't land a door next to a diagonal wall, the report says so honestly
(`diagonalDoorConfirmed`-style note) rather than claiming a geometry fact the harness didn't observe.
The scene still renders and is still lint-checked either way.

The remaining 4 of the §6.3 corpus (opaque standee + translucent FX overlap, bloom-only emissive
beside bright diffuse stone, maximum dressing/cover/centerpiece room, known sprite alpha/depth
regression fixture) are **not built by this unit** — the task brief's own floor is "at least" these
four. Adding the rest is mechanical (copy a `build*` function + register it in `FIXTURES`) once a
maintainer wants the full 8-scene corpus; left for a follow-up rather than padding this unit's scope.

## Negative control (required — both directions)

`runNegativeControl()` builds a throwaway, app-independent `<canvas>` with a minimal valid WebGL1
program whose fragment shader references a uniform (`uMissing`) that is **deliberately never set**
before `drawArrays()`. `webgl-lint`'s own `failUnsetUniforms` check (default: on) is documented to fire
on exactly this shape of bug. `report.json`'s `negativeControl.caught` must be `true` for the run to be
trusted — if it's `false`, the harness exits nonzero and the corpus's "zero errors" result should NOT be
trusted (means the injection itself is broken, not that the app is clean).

## Spector.js

Two separate spikes, per §3.7:

1. **Standalone capture** (`runSpectorStandaloneSmoke()`) — attempted once per run, against a minimal
   synthetic draw (not the full production scene — see the function's own header for why capturing a
   live Three.js scene's async rAF timing reliably from a cold headless launch is a separate, higher-
   risk spike). Result lands in `report.json.spectorStandalone`.
2. **MCP feasibility** (§6.4) — **not attempted**: no Spector MCP server is registered/reachable in
   this Claude Code session. Recorded honestly in `report.json.spectorMcpFeasibility` as a documented
   blocker, per §6.4's own instruction ("If the current Claude environment cannot connect to the MCP
   server, retain Spector as a standalone capture tool. Do not block geometry work."). Spector is
   retained as the standalone tool above; nothing here is blocked on the MCP spike.

## Why this is safe (the charter's "canonical contracts preserved" requirement)

- `webgl-lint`/`spectorjs` are resolved from `GEOMETRY_TOOLS_HOME` (R0's pinned scratch install,
  `~/.genesis-geometry-tools` by default) via `createRequire` — never vendored into the repo tree,
  never a `src/` or `data/` file.
- Injection happens via Puppeteer `evaluateOnNewDocument`, scoped to THIS script's own browser page.
  It runs before any of `genesis.html`'s own scripts, patching `HTMLCanvasElement.prototype.getContext`
  before `theater-boot.js`'s `mount()` ever calls it — but only because this script chose to register
  that hook. A plain `python3 -m http.server` + a browser tab hitting `genesis.html` directly (the
  documented `CLAUDE.md` "Run it" path) never sees any of this.
- The renderer-instance capture patch (`THREE.WebGLRenderer.prototype.render`) calls straight through
  to the original function every time, with the original arguments and return value — it stashes a
  reference for read-out and changes zero rendering behavior. `readRendererInfo()`'s
  `lintWrapConfirmed` field is direct proof (via the real `GMAN_debug_helper` WebGL extension on the
  actual live context) that the exact context `theater-boot.js` created got wrapped — not an inference.
- `checkBootPathAbsence()` greps `genesis.html`, `manifest.json`, and every file under `src/` for
  `webgl-lint` / `spectorjs` / `graphics-debug` / `GMAN_debug_helper` / `GEOMETRY_TOOLS_HOME` and fails
  the run if any hit — a structural proof, re-run every invocation, not a one-time claim.
