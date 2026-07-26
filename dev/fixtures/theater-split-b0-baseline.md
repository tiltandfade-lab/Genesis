# THEATER SPLIT — B0 baseline harness census (2026-07-25)

Branch `refactor/theater-boot-split` at the clay/cl-r1-r3 merge (theater-boot.js 21,515 lines
pre-extraction). Machine: Adam's MacBook (Iris Plus 645), headless Chrome via
`~/.genesis-jsdom` puppeteer-core. **CI SKIPS all 19 puppeteer harnesses below — they only run
by hand, and a checkpoint of this split is NOT green until they have been run on this machine
and recorded here.** (Recon memo §5.2; the single most important operational fact of this
refactor. A "CI green" claim alone is a lie of omission.)

The surface contract freeze lives beside this file: `theater-surface-baseline.json` (218
window.Theater keys + per-key shape, both boot modes) — gated by `dev/verify-theater-surface.mjs`
at every step.

## The 19 by-hand gates — baseline results

| harness | result | notes |
|---|---|---|
| verify-agx-tonecurve | 25/0 ✓ | |
| verify-board-admission-dirty-key | 10/0 ✓ (`--with-render`) | skips (0/0) without the flag — always pass the flag at checkpoints; needed the awakened-shrub legacy+candidate assets materialized (LFS) |
| verify-bw2-1b-occlusion | 24/0 jsdom + `--with-render` rerun below | was 0/1: runner lacked the light-recipe classic-global stubs bw2-2's runner has (fixed this commit — parity, not weakening) |
| verify-bw2-2-floor-contact | 51/0 ✓ | |
| verify-diegetic-light | 57/7 | **inherited** — LFS-pointer env (same 7 as the clay-lane record) |
| verify-env1-light-profiles | 27/1 | **explained** — torchlit OLD-vs-NEW pixel diff 0.0177 > 0.01: Checkpoint 3 *deliberately* changed torchlit (crystal/lava fixtures, recipe void); expectation pins the pre-correction look. Verdict on the new look is Adam's; the expectation update belongs to the clay lane at clean close, NOT to this refactor |
| verify-env1b-tabletop-shadows | 34/1 | **explained** — same torchlit diff (0.0174) |
| verify-env1c-celestial-arc | 23/1 | **explained** — same torchlit diff (0.0174) |
| verify-env3-town | rerun below | was crashed: dev/theater-preview.html lacked the light-recipes classic scripts theater-boot's eval now needs (page fixed this commit) |
| verify-interior-camera-frustum | 12/2 | **inherited** (same 2 as the clay-lane record) |
| verify-light-lab | 42/0 ✓ | LIGHT_LAB_SHOTS_DIR redirected (protected shots law) |
| verify-mf1-camera-tweens | 24/0 ✓ | |
| verify-mf4-turn-rhythm | rerun below | PART A was red: fixture sprites (Skeleton/Zombie) were LFS pointers in this worktree; materialized selectively per the LFS law |
| verify-occlusion-fade | 37/3 | **inherited** (same 3 as the clay-lane record) |
| verify-qfb-tray | rerun below | same theater-preview.html page defect as env3-town |
| verify-shot-compose | rerun below | 26/3 was frac=null: Guard/Skeleton fixture sprites were LFS pointers |
| verify-transparent-material-contract | ✓ exit 0 | texture 404 console noise from LFS-pointer PNGs; assertions green |
| verify-vp1c-kaiju-leak | rerun below (`--with-render`) | skips without the flag |
| verify-wallhang-placement | 50/0 ✓ | |

## Post-fix rerun (same machine, same session)

| harness | result |
|---|---|
| verify-env3-town | **34/0 ✓** (was crashed — preview-page fix) |
| verify-qfb-tray | **37/0 ✓** (same fix) |
| verify-mf4-turn-rhythm | **36/0 ✓** (was 3 reds — Skeleton/Zombie sprites materialized) |
| verify-shot-compose | **29/0 ✓** (was 3 reds — Guard/Skeleton sprites materialized) |
| verify-vp1c-kaiju-leak --with-render | **6/0 ✓** (was 6/1 — stale text pin: setInteriorBoard grew a renderOpts param in the clay lane; regex updated, check's job unchanged) |
| verify-board-admission-dirty-key --with-render | **10/0 ✓** (was 8/2 — awakened-shrub legacy+candidate assets were LFS pointers) |
| verify-bw2-1b-occlusion --with-render | **49/0 ✓** (full render path after the runner-parity fix) |

**Net baseline: every gate green except the named inherited/explained reds** — diegetic-light 7
(LFS env), interior-camera-frustum 2, occlusion-fade 3 (all inherited, same as the clay-lane
record), and the env1/env1b/env1c torchlit pixel-diff 1 each (deliberate C3 torchlit change vs a
pre-correction pinned look; Adam's verdict pending; expectation update belongs to the clay lane).

## Defects found BY the census (recorded per the brief's "record, repair separately" law)

1. **dev/theater-preview.html missed the CL-R2 registry unification** — theater-boot's module
   eval now requires `LIGHT_RECIPE_REGISTRY`/`LIGHT_LAB_COMPILED_SETTINGS` classic globals; the
   preview page never loaded `data/light-profile-locks.js` + `src/engine/light-recipes.js`.
   Any page carrying theater-boot must mirror genesis.html's classic-script prelude. Fixed in
   this commit (page-level, behavior of genesis.html untouched).
2. **verify-bw2-1b-occlusion's jsdom runner drifted from bw2-2's** — bw2-2 gained the
   light-recipe global stubs when the registry landed; bw2-1b didn't. Fixed in this commit.
3. **verify-vp1c-kaiju-leak's mutation-check regex pinned the old setInteriorBoard signature**
   (`(data)` vs the clay lane's `(data, renderOpts)`). Regex widened; the protected property
   (both clearGroup calls inside the function) unchanged. This is the recon's source-text-pin
   class showing up live — expect more at each extraction step.

## Environment law for this worktree

LFS assets stay pointers except the selective set the harness fixtures and future capture pairs
need (mirrors the clay worktree's own 8-sprite set + Guard/Skeleton/Zombie + assets/battle/*).
Bulk smudge remains forbidden (repo LFS law).
