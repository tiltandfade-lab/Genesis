---
type: verification-record
project: Genesis
status: RETAINED WAVE-0 BEFORE-STATE
created: 2026-07-29
source_revision: b72228b38cf6e59b0f391d656f3d37756b294eb0
branch: feat/golden-vignette-wave0
---

# GOLDEN VIGNETTE WAVE-0 BASELINE

## Outcome

The current production walk, combat, state, terrain, Clayroom, manifest, and
bridgeless-game paths were green before Procedural Vignette Synthesizer runtime work.
This is the comparison point for Wave 1.

No product module, table, renderer, walk distribution, or saved fixture was changed to
obtain these results.

## Walk and request-source lane

Passed:

- `node dev/verify-walk.mjs` — 2,803/2,803
- `node dev/verify-travel-walks.mjs` — 28/28
- `node dev/verify-job-walks.mjs` — 41/41
- `node dev/verify-walk-consumption.mjs` — 37/37
- `node dev/verify-walk-binding.mjs` — 100/100
- `node dev/verify-walk-card-projection.mjs` — 29/29
- `node dev/verify-walk-stamped-provenance.mjs` — 34/34
- `node dev/verify-walk-scene.mjs` — 32/32
- `node dev/verify-walk-census-baseline.mjs` — retained 1,050-call partition closed

Known before-state: several optional compiled tables report null-safe skipped dressing
or ambient branches. Those messages predate this program and are not Wave-0 failures.

## Combat, state, and persistence lane

Passed:

- `node dev/verify-combat.mjs` — 63/63
- `node dev/verify-combat-actions.mjs` — 38/38
- `node dev/verify-combat-cells.mjs` — 13/13
- `node dev/verify-combat-lifecycle.mjs` — 69/69
- `node dev/verify-combat-tracker.mjs` — 31/31
- `node dev/verify-f1-combat-in-room.mjs` — 65/65
- `node dev/verify-capture.mjs` — 21/21
- `node dev/verify-seam.mjs` — 29/29
- `node dev/verify-dm-events.mjs` — 70/70
- `node dev/verify-storage.mjs` — 49/49

The room-combat gate preserved an identical scene-recipe hash from exploration into
combat and back across rectangular, octagonal, cave, tiered, and overloaded rooms.

Known before-state:

- combat lifecycle prints non-blocking payload-drift warnings for three
  `crit_outcome` keys while all assertions pass;
- the F1 red-first historical bundle cannot load
  `data/light-profile-locks.js` from old revision `1a4bf607`, so that historical
  section is skipped while the live 65 assertions pass.

## Terrain and Clayroom lane

Passed:

- `node dev/verify-terrain-features.mjs` — 61/61
- `node dev/verify-terrain-expression.mjs` — 80/80
- `node dev/verify-terrain-expression-r2.mjs` — 53/53
- `node dev/verify-terrain-bench.mjs` — 77/77
- `node dev/verify-stage-c-terrain.mjs` — 60/60
- `node dev/verify-clay-room.mjs` — 272/272

The current terrain gates explicitly preserve:

- connected responsive natural edges and varied local angles;
- no regular sedimentary face banding;
- no diagonal zipper seam;
- no global terrain-height cap;
- a 12h/30-foot switchback plus 10h alternate climb;
- three- and four-storey far-camera construction;
- natural/constructed form separation;
- reachable standable surfaces and owned 2h+ faces.

Environment note: the shared
`~/.genesis-jsdom/node_modules/three/three.module.js` shim points to a removed historic
worktree. The Stage-C and Clayroom run temporarily resolved the package to this
revision's checked-in `vendor/three/three.module.js`; all engine assertions then passed.
This is a local dependency-path repair item, not an engine failure.

## Bridgeless playable flow

The real bridgeless harness ran in a disposable directory with seed `20260729`:

1. initialized `Wave Zero Baseline` and Level-1 Human Fighter `Mira`;
2. rolled `The Iron-Strap Bridge` and the current world/PC state;
3. accepted the player action: “I study the immediate place, its exits, and anyone
   present before committing to a route.”;
4. produced an 8,455-byte DM digest on the expected `deep/new-place` lane;
5. applied a valid narration-only TurnResponse with zero contract errors; and
6. returned a player view with unchanged HP/location/clock and the exact two-line
   transcript.

This is a game-flow sentinel, not a qualitative AI-DM playtest and not synthesized
terrain evidence.

## Repository integrity

- `python3 build/check-manifest.py` — `RESULT: OK` with existing layer warnings
- `python3 build/archive-docs.py --check` — `RESULT: OK`
- `git diff --check` — clean
- all three Wave-0 machine inventories parse with `jq`

## Wave-1 comparison law

Wave 1 reruns these lanes after each relevant adapter/checkpoint. A new failure is
presumed to be a regression until isolated. Existing warnings above may be improved in
their owning lane, but the demand observatory may not hide or relabel them.
